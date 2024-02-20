import fs from 'fs';
import path from 'path';
import express from 'express';
import cors from 'cors';
import { promisify } from 'util';
import multer from 'multer';
import crypto from 'crypto';
import sizeOf from 'image-size';
import cheerio from 'cheerio';
import axios from 'axios';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const app = express();
const port = 3004;

app.use(bodyParser.json());

app.use(cors());

const copyFileAsync = promisify(fs.copyFile);
const readdirAsync = promisify(fs.readdir);
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

// Configuración de Multer
const storage = multer.memoryStorage(); // Almacena la imagen en memoria en lugar de guardarla en el disco
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 1 MB (puedes ajustar este límite según tus necesidades)
        files: 1, // Permite subir solo un archivo a la vez
    },
    fileFilter: (req, file, cb) => {
        const allowedFileTypes = /jpeg|jpg|png|svg/;
        const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedFileTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb('Error: El archivo debe ser una imagen de formato jpeg, jpg, png o svg.');
        }
    },
});

app.post('/create-map', async (req, res) => {
    try {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        await new Promise(resolve => req.on('end', resolve));
        const parsedBody = JSON.parse(body);
        const { name } = parsedBody;
        console.log('name===>');
        console.log(name);
        const formattedName = name.replace(/ /g, '-').toLowerCase();
        const sourceFilePath = './templates/data-lots.json';
        const targetFilePath = `${formattedName}.json`;
        if (fs.existsSync(targetFilePath)) {
            res.status(409).end(`Ya existe un mapa con ese nombre.`);
            return;
        }
        await copyFileAsync(sourceFilePath, targetFilePath);
        res.status(200).end(`El mapa ${name} ha sido creado correctamente!`);
    } catch (err) {
        res.status(500).end('Error al duplicar el archivo.');
    }
});

app.get('/get-maps', async (req, res) => {
  try {
    const directoryPath = './';
    const files = await readdirAsync(directoryPath);
    const jsonFiles = files.filter(file => path.extname(file) === '.json');
    const filesInfo = await Promise.all(jsonFiles.map(async (file) => {
      const filePath = path.join(directoryPath, file);
      const stats = await fs.promises.stat(filePath);
      return {
        name: formatFileName(file),
        path: filePath,
        isDirectory: stats.isDirectory(),
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
      };
    }));

    res.json(filesInfo);
  } catch (error) {
    res.status(500).send('Error al obtener la lista de archivos.');
  }
});


app.post('/map-save', async (req, res) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString(); // convert Buffer to string
    });
    req.on('end', () => {
      let parsed = JSON.parse(body);
      const fileName = parsed.target;
      delete parsed.target;

      // Sanitize and validate the file name
      const sanitizedFileName = fileName.replace(/[^a-z0-9_.-]/gi, '');
      if (sanitizedFileName !== fileName) {
        res.statusCode = 400;
        res.end('Invalid file name');
        return;
      }

      // Check if the file name is a valid file name
      if (path.isAbsolute(sanitizedFileName) || sanitizedFileName.includes('..') || sanitizedFileName.includes('/')) {
        console.log('Error: Invalid file name, it should not be a path to a different directory');
        res.statusCode = 400;
        res.end('Invalid file name, it should not be a path to a different directory');
        return;
      }

      fs.writeFile(`${sanitizedFileName}`, JSON.stringify(parsed), (err) => { //, null, '\t'
        if (err) throw err;
        console.log(`Los cambios han sido guardados`);
        res.end(`Los cambios han sido guardados`);
      });
    });
});


app.post('/layer-image', upload.single('image'), async (req, res) => {
  try {

    const idLayer = req.body.layer_id;
    const nameJsonFile = req.body.name_json_file;

    if (!nameJsonFile) {
      return res.status(401).send('Error: No se proporcionó un nombre json.');
    }

    if (!idLayer) {
      return res.status(401).send('Error: No se proporcionó un ID de capa.');
    }

    if (!req.file) {
      return res.status(401).send('Error: No se proporcionó ninguna imagen.');
    }

    if (req.file.width < 1000 || req.file.height < 1000) {
      return res.status(409).send('Error: La imagen debe tener al menos 1000px de ancho y 1000px de alto.');
    }

    const targetDirectory = './assets/maps/';

    const originalExtension = path.extname(req.file.originalname);

    // Generar un nombre aleatorio de 16 caracteres
    let randomName = crypto.randomBytes(8).toString('hex') + crypto.randomBytes(8).toString('hex');

    const targetFileName = `${randomName}${originalExtension}`;

    const targetFilePath = path.join(targetDirectory, targetFileName);

    fs.writeFileSync(targetFilePath, req.file.buffer);

    // Verificar si el archivo existe después de escribirlo
    if (fs.existsSync(targetFilePath)) {

      const jsonFilePath = './'+nameJsonFile;
      const jsonData = await readFileAsync(jsonFilePath, 'utf8');
      const json = JSON.parse(jsonData);

      const layerIndex = json.layers.findIndex((layer) => layer.id === idLayer);

      if (layerIndex !== -1) {
        json.layers[layerIndex].file = `assets/maps/${targetFileName}`;
      }

      try {
        await writeFileAsync(jsonFilePath, JSON.stringify(json, null, 2), 'utf8');
      } catch (writeFileError) {
        console.error('Error al escribir el archivo JSON:', writeFileError);
        return res.status(500).end('Error al escribir el archivo JSON.');
      }

      res.status(200).json({ message: 'Imagen cargada correctamente y JSON actualizado!', json });
    } else {
      res.status(500).end('Error al cargar la imagen 01.');
    }
  } catch (err) {
    res.status(500).end('Error al cargar la imagen 02.');
  }
});

app.post('/location-image', upload.single('image'), async (req, res) => {
  try {

    const idLocation = req.body.location_id;
    const nameJsonFile = req.body.name_json_file;

    const dimensions = sizeOf(req.file.buffer);
    if (dimensions.width > 700 || dimensions.height > 1100) {
      return res.status(401).json({ message: 'Error: La imagen es demasiado grande, se recomienda 250w x 380h.' });
    }

    const targetDirectory = './assets/locations/';
    const originalExtension = path.extname(req.file.originalname);
    let randomName = crypto.randomBytes(8).toString('hex') + crypto.randomBytes(8).toString('hex');
    const targetFileName = `${randomName}${originalExtension}`;
    const targetFilePath = path.join(targetDirectory, targetFileName);
    fs.writeFileSync(targetFilePath, req.file.buffer);

    // Verificar si el archivo existe después de escribirlo
    if (fs.existsSync(targetFilePath)) {

      const jsonFilePath = './'+nameJsonFile;
      const jsonData = await readFileAsync(jsonFilePath, 'utf8');
      const json = JSON.parse(jsonData);

      const locationIndex = json.locations.findIndex((location) => location.id === idLocation);

      if (locationIndex !== -1) {
        json.locations[locationIndex].image = `assets/locations/${targetFileName}`;
      }

      try {
        await writeFileAsync(jsonFilePath, JSON.stringify(json, null, 2), 'utf8');
      } catch (writeFileError) {
        console.error('Error al escribir el archivo JSON:', writeFileError);
        return res.status(500).end('Error al escribir el archivo JSON.');
      }

      res.status(200).json({ message: 'Imagen cargada correctamente.', json });
    } else {
      res.status(500).end('Error al cargar la imagen 01.');
    }
  } catch (err) {
    res.status(500).end('Error al cargar la imagen 02.');
  }
});


function convertirObjetoAJSON(objeto, visto = new Set()) {
  if (visto.has(objeto)) {
    // Si el objeto ya se ha visto, devolver un marcador de posición para la referencia circular
    return '[Circular Reference]';
  }

  // Agregar el objeto actual al conjunto
  visto.add(objeto);

  const resultado = {};

  for (const clave in objeto) {
    if (objeto.hasOwnProperty(clave)) {
      const valor = objeto[clave];

      if (typeof valor === 'object' && valor !== null) {
        // Si el valor es un objeto, llamar recursivamente a la función
        resultado[clave] = convertirObjetoAJSON(valor, visto);
      } else {
        // Si no es un objeto, simplemente asignar el valor
        resultado[clave] = valor;
      }
    }
  }

  return resultado;
}


app.post('/scrape', async (req, res) => {

  let body = '';
  req.on('data', chunk => {
      body += chunk.toString();
  });
  await new Promise(resolve => req.on('end', resolve));
  const parsedBody = JSON.parse(body);
  const { title, url } = parsedBody;


  try {

    const formattedName = title.replace(/ /g, '-').toLowerCase();
    const sourceFilePath = './templates/data-lots-emptylocations.json';
    const targetFilePath = `${formattedName}.json`;
    if (fs.existsSync(targetFilePath)) {
        res.status(409).end(`Ya existe un mapa con ese nombre.`);
        return;
    }
    await copyFileAsync(sourceFilePath, targetFilePath);

    const response = await axios.get(url);
    // Cargar el contenido HTML en Cheerio
    const $ = cheerio.load(response.data);
    const data = $._root.children;
    const newObj = []; 
    var counter = 0;
    const jsonContent = await fs.promises.readFile(targetFilePath, { encoding: 'utf-8' });
    const parsedJson = JSON.parse(jsonContent);
    for (const key in data) {
        const point = data[counter];
        const objetoConvertido = convertirObjetoAJSON(point);
        var newElement = { 
          id: objetoConvertido['id'],
          title: 'Lote '+objetoConvertido['id'],
          area: objetoConvertido['superficie'],
          layer: 'lot-map',
          action: 'tooltip',
          type: 'circle',
          disable: false,
          desc: 'Manzana: '+objetoConvertido['manzana']+', lote: '+objetoConvertido['lote'],
          ubicacion: objetoConvertido['ubicacion'],
          superficie_frente: objetoConvertido['superficie_frente'],
          ubicacion_ne: objetoConvertido['ubicacion_ne'],
          ubicacion_se: objetoConvertido['ubicacion_se'],
          ubicacion_so: objetoConvertido['ubicacion_so'],
          ubicacion_no: objetoConvertido['ubicacion_no'],
          manzana: objetoConvertido['manzana'],
          lote: objetoConvertido['lote'],
          fecha_entrega: objetoConvertido['fecha_entrega'],
          precio_m2_contado: objetoConvertido['precio_m2_contado'],
          precio_contado: objetoConvertido['precio_contado'],
          precio_m2_6meses: objetoConvertido['precio_m2_6meses'],
          precio_6meses: objetoConvertido['precio_6meses'],
          precio_m2_12meses: objetoConvertido['precio_m2_12meses'],
          precio_12meses: objetoConvertido['precio_12meses'],
          precio_m2_18meses: objetoConvertido['precio_m2_18meses'],
          precio_18meses: objetoConvertido['precio_18meses'],
          precio_m2_24meses: objetoConvertido['precio_m2_24meses'],
          precio_24meses: objetoConvertido['precio_24meses'],
          precio_m2_36meses: objetoConvertido['precio_m2_36meses'],
          precio_36meses: objetoConvertido['precio_36meses'],
          estatus: objetoConvertido['estatus'],
          activo: objetoConvertido['activo']
        };
        if (objetoConvertido['estatus']==0) {
          newElement.style = 'reservado';
          newElement.group = ["Reservado"];
        }else if (objetoConvertido['estatus']==1) {
          newElement.style = 'disponible';
          newElement.group = ["Disponible"];
        }else{
          newElement.style = 'vendido';
          newElement.group = ["Vendido"];
        }
      newObj.push(newElement);
      counter++;
    }
    parsedJson.locations = parsedJson.locations.concat(newObj);
    await fs.promises.writeFile(targetFilePath, JSON.stringify(parsedJson, null, 2), 'utf-8');
    res.status(200).json({ message: 'Mapa importado correctamente.' });
  } catch (error) {
    console.error('Error al hacer scraping:', error);
    res.status(500).send('Error al hacer scraping');
  }
});

function formatFileName(fileName) {
  let formattedName = fileName.replace(/-/g, ' ');
  formattedName = formattedName.replace(/\b\w/g, (match) => match.toUpperCase());
  formattedName = formattedName.replace(/\.json$/, '');
  formattedName = formattedName.replace(/\.Json$/, '');
  return formattedName;
}


/*USERS*/
// Ruta para autenticación y generación de token
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const usersFilePath = 'users.json';
  let users = [];
  
  try {
    const usersData = fs.readFileSync(usersFilePath);
    users = JSON.parse(usersData);
  } catch (error) {
    console.error('Error al leer el archivo de usuarios:', error);
  }

  //GENERACION DE CONTRASEÑAS
  //const saltRounds = 10;
  //const hashedPassword = bcrypt.hashSync(password, saltRounds);
  //console.log('Contraseña original:', password);
  //console.log('Contraseña hasheada:', hashedPassword);
  
  // Encuentra al usuario en la base de datos
  const user = users.find((u) => u.username === username);

  console.log('user==>');
  console.log(user);

  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ message: 'Credenciales inválidas' });
  }

  // Genera un token
  const token = jwt.sign({ userId: user.id, username: user.username }, 'clave_secreta', {
    expiresIn: '1h', // Tiempo de expiración del token
  });

  // Devuelve el token en formato JSON
  res.json({ token, message: 'Inicio de sesión exitoso' });
});

// Ruta protegida que requiere token para acceder
app.get('/secure', authenticateToken, (req, res) => {
  res.json({ message: 'Ruta protegida' });
});

// Middleware para verificar el token
function authenticateToken(req, res, next) {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ message: 'Acceso no autorizado' });
  }

  jwt.verify(token, 'clave_secreta', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido' });
    }

    req.user = user;
    next();
  });
}


app.use((req, res) => {
    res.status(404).end();
});

const server = app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed.');
        process.exit(0);
    });
});