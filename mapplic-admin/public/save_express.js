import fs from 'fs';
import https from 'https';
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

app.use(bodyParser.json());

//const corsOptions = {
//  origin: 'https://mapplic.bloque9.us:443',
//  optionsSuccessStatus: 200 // algunas versiones de CORS de Express requieren esto
//};
//app.use(cors(corsOptions));

app.use(cors({ origin: '*' }));

// Middleware para agregar encabezados de no caché a todas las respuestas
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  next();
});

// Middleware para configurar Content Security Policy (CSP)
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "frame-ancestors 'self' https://mapplic.bloque9.com");
  next();
});

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
        const parsedBody = req.body; // Express ya ha analizado el cuerpo del JSON
        const { name } = parsedBody;
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
        res.status(200).json({ message: 'Los cambios han sido guardados' });
      });
    });
});

app.post('/layer-image', upload.single('image'), async (req, res) => {
  try {

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

    if (fs.existsSync(targetFilePath)) {
      const imageResponse = targetFilePath.replace(/\\/g, '/');
      res.status(200).json({ 
        message: 'Imagen cargada correctamente y JSON actualizado!',
        image: imageResponse
      });
    } else {
      res.status(500).end('Error al cargar la imagen 01.');
    }
  } catch (err) {
    console.error(err);
    res.status(500).end('Error al cargar la imagen 02.');
  }
});

app.post('/layer-image___', upload.single('image'), async (req, res) => {
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

app.post('/sync-map', async (req, res) => {
    try {
        const parsedBody = req.body;
        const { fileName } = parsedBody;
        const targetFilePath = './'+fileName;

        if (!fs.existsSync(targetFilePath)) {
            return res.status(409).end(`No existe un mapa con ese nombre.`);
        }

        const jsonContent = await readFileAsync(targetFilePath, { encoding: 'utf-8' });
        const parsedJson = JSON.parse(jsonContent);
        const url = parsedJson.settings.import_url;

        const locations_json = parsedJson.locations;

        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        const data = $._root.children;

        const objects = [];

        var exist = false;
        var x_ = .05;
        var y_ = .1;
        var last_action = '';
        var last_type = '';
        let counter = 0;
        for (const key in data) {
            const point = data[counter];
            const objetoConvertido = convertirObjetoAJSON(point);
            exist = false;
            locations_json.forEach(function(location) {
                last_action = location.action;
                last_type = location.type;
                if (location.id===objetoConvertido['id']) {
                    exist = true;
                    location.area = objetoConvertido['superficie'];
                    location.ubicacion = objetoConvertido['ubicacion'];
                    location.superficie_frente = objetoConvertido['superficie_frente'];
                    location.ubicacion_ne = objetoConvertido['ubicacion_ne'];
                    location.ubicacion_se = objetoConvertido['ubicacion_se'];
                    location.ubicacion_so = objetoConvertido['ubicacion_so'];
                    location.ubicacion_no = objetoConvertido['ubicacion_no'];
                    location.manzana = objetoConvertido['manzana'];
                    location.lote = objetoConvertido['lote'];
                    location.fecha_entrega = objetoConvertido['fecha_entrega'];
                    location.precio_m2_contado = objetoConvertido['precio_m2_contado'];
                    location.precio_contado = objetoConvertido['precio_contado'];
                    location.precio_m2_6meses = objetoConvertido['precio_m2_6meses'];
                    location.precio_6meses = objetoConvertido['precio_6meses'];
                    location.precio_m2_12meses = objetoConvertido['precio_m2_12meses'];
                    location.precio_12meses = objetoConvertido['precio_12meses'];
                    location.precio_m2_18meses = objetoConvertido['precio_m2_18meses'];
                    location.precio_18meses = objetoConvertido['precio_18meses'];
                    location.precio_m2_24meses = objetoConvertido['precio_m2_24meses'];
                    location.precio_24meses = objetoConvertido['precio_24meses'];
                    location.precio_m2_36meses = objetoConvertido['precio_m2_36meses'];
                    location.precio_36meses = objetoConvertido['precio_36meses'];
                    location.dto_contado = objetoConvertido['dto_contado'];
                    location.dto_6meses = objetoConvertido['dto_6meses'];
                    location.dto_12meses = objetoConvertido['dto_12meses'];
                    location.dto_18meses = objetoConvertido['dto_18meses'];
                    location.dto_24meses = objetoConvertido['dto_24meses'];
                    location.dto_36meses = objetoConvertido['dto_36meses'];
                    location.estatus = objetoConvertido['estatus'];
                    location.activo = objetoConvertido['activo'];
                    if (objetoConvertido['estatus'] == 0) {
                        location.style = 'reservado';
                        location.group = ["Reservado"];
                    } else if (objetoConvertido['estatus'] == 1) {
                        location.style = 'disponible';
                        location.group = ["Disponible"];
                    } else {
                        location.style = 'vendido';
                        location.group = ["Vendido"];
                    }
                    objects.push(location);
                } 
            });
            if (!exist) {
                console.log('NO EXISTE CON EL ID: '+objetoConvertido['id']);
                if (y_ == 1) {
                  y_ = .05;
                  x_ = parseFloat((x_ + 0.05).toFixed(2)); 
                }
                var newElement = {
                    id: objetoConvertido['id'],
                    title: 'Lote ' + objetoConvertido['id'],
                    area: objetoConvertido['superficie'],
                    layer: 'lot-map',
                    action: last_action,
                    type: last_type,
                    disable: false,
                    desc: 'Manzana: ' + objetoConvertido['manzana'] + ', lote: ' + objetoConvertido['lote'],
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
                    dto_contado: objetoConvertido['dto_contado'],
                    dto_6meses: objetoConvertido['dto_6meses'],
                    dto_12meses: objetoConvertido['dto_12meses'],
                    dto_18meses: objetoConvertido['dto_18meses'],
                    dto_24meses: objetoConvertido['dto_24meses'],
                    dto_36meses: objetoConvertido['dto_36meses'],
                    estatus: objetoConvertido['estatus'],
                    activo: objetoConvertido['activo'],
                    coord: [x_,y_],
                    showButton: true
                };
                y_ = parseFloat((y_ + 0.05).toFixed(2));
                if (objetoConvertido['estatus'] == 0) {
                    newElement.style = 'reservado';
                    newElement.group = ["Reservado"];
                } else if (objetoConvertido['estatus'] == 1) {
                    newElement.style = 'disponible';
                    newElement.group = ["Disponible"];
                } else {
                    newElement.style = 'vendido';
                    newElement.group = ["Vendido"];
                }
                objects.push(newElement);
            }
            counter++;
        }
        parsedJson.locations = objects;
        await writeFileAsync(targetFilePath, JSON.stringify(parsedJson, null, 2), 'utf-8');
        var json = parsedJson;
        res.status(200).json({ message: 'Mapa sincronizado correctamente.', json });
    } catch (error) {
        console.error('Error al sincronizar:', error);
        res.status(500).send('Error al sincronizar');
    }
});


app.post('/scrape', async (req, res) => {
    try {
        const parsedBody = req.body;
        const { title, url, type, action } = parsedBody;

        const formattedName = title.replace(/ /g, '-').toLowerCase();
        const sourceFilePath = './templates/data-lots-emptylocations.json';
        const targetFilePath = `${formattedName}.json`;

        if (fs.existsSync(targetFilePath)) {
            return res.status(409).end(`Ya existe un mapa con ese nombre.`);
        }

        await copyFileAsync(sourceFilePath, targetFilePath);

        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        const data = $._root.children;
        const newObj = [];
        let counter = 0;

        const jsonContent = await readFileAsync(targetFilePath, { encoding: 'utf-8' });
        const parsedJson = JSON.parse(jsonContent);

        var x_ = .05;
        var y_ = .1;
        for (const key in data) {
            if (y_ == 1) {
              y_ = .05;
              x_ = parseFloat((x_ + 0.05).toFixed(2)); 
            }
            const point = data[counter];
            const objetoConvertido = convertirObjetoAJSON(point);
            var newElement = {
                id: objetoConvertido['id'],
                title: 'Lote ' + objetoConvertido['id'],
                area: objetoConvertido['superficie'],
                layer: 'lot-map',
                action: action,
                type: type,
                disable: false,
                desc: 'Manzana: ' + objetoConvertido['manzana'] + ', lote: ' + objetoConvertido['lote'],
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
                dto_contado: objetoConvertido['dto_contado'],
                dto_6meses: objetoConvertido['dto_6meses'],
                dto_12meses: objetoConvertido['dto_12meses'],
                dto_18meses: objetoConvertido['dto_18meses'],
                dto_24meses: objetoConvertido['dto_24meses'],
                dto_36meses: objetoConvertido['dto_36meses'],
                estatus: objetoConvertido['estatus'],
                activo: objetoConvertido['activo'],
                coord: [x_,y_],
                showButton: true
            };
            y_ = parseFloat((y_ + 0.05).toFixed(2));
            if (objetoConvertido['estatus'] == 0) {
                newElement.style = 'reservado';
                newElement.group = ["Reservado"];
            } else if (objetoConvertido['estatus'] == 1) {
                newElement.style = 'disponible';
                newElement.group = ["Disponible"];
            } else {
                newElement.style = 'vendido';
                newElement.group = ["Vendido"];
            }
            newObj.push(newElement);
            counter++;
        }
        var import_url = {
            import_url: url
        };
        parsedJson.settings = { ...parsedJson.settings, ...import_url };
        parsedJson.locations = parsedJson.locations.concat(newObj);
        await writeFileAsync(targetFilePath, JSON.stringify(parsedJson, null, 2), 'utf-8');
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

  const usersFilePath = './data/users.json';
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

app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
        res.redirect(`https://${req.headers.host}${req.url}`);
    } else {
        next();
    }
});


const options = {
    key: fs.readFileSync('/etc/letsencrypt/live/mapplic.bloque9.us/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/mapplic.bloque9.us/fullchain.pem')
};

const server = https.createServer(options, app);

const port = 2053;

server.listen(port, () => {
    console.log(`Servidor Express con SSL escuchando en el puerto ${port}`);
});