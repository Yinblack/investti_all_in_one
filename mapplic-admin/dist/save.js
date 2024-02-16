import fs from 'fs';
import path from 'path';
import http from 'http';

console.log('Mapplic save script is running.');

const server = http.createServer(async  (req, res) => {
	if (req.method === 'POST' && req.url === '/mapplic-save') {
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
				console.log(`${sanitizedFileName} has been saved!`);
				res.end(`${sanitizedFileName} has been saved!`);
			});
		});
	} else if (req.method === 'POST' && req.url === '/mapplic-create'){
    	let body = '';
    	req.on('data', chunk => {
    	    body += chunk.toString(); // convert Buffer to string
    	});
    	req.on('end', () => {
    	    let parsed = JSON.parse(body);
    	    const name = parsed.name;
    	    // Formatea el nombre para que sea válido como un nombre de archivo
    	    const formattedName = name.replace(/ /g, '-').toLowerCase(); // Reemplaza espacios por guion medio y convierte a minúsculas
    	    // Duplica el archivo data-lots.json
    	    const sourceFilePath = 'data-lots.json';
    	    const targetFilePath = `${formattedName}.json`;

        	// Verifica si el archivo de destino ya existe
        	if (fs.existsSync(targetFilePath)) {
        	    res.statusCode = 409; // 409 Conflict indica conflicto, es decir, el recurso ya existe
        	    res.end(`El archivo ${targetFilePath} ya existe. No se permiten duplicados.`);
        	    return;
        	}

    	    // Si el archivo no existe, procede a copiarlo
    	    fs.copyFile(sourceFilePath, targetFilePath, (err) => {
    	        if (err) {
    	            console.error(err);
    	            res.statusCode = 500;
    	            res.end('Error al duplicar el archivo.');
    	            return;
    	        }
    	        res.statusCode = 200;
    	        console.log(`${sourceFilePath} ha sido duplicado como ${targetFilePath}!`);
    	        res.end(`${sourceFilePath} ha sido duplicado como ${targetFilePath}!`);
    	    });
    	});
	} else if (req.method === 'GET' && req.url === '/mapplic-get'){
	    try {
	      // Ruta del directorio que contiene los archivos JSON
	      const directoryPath = '/';
	
	      // Lee todos los archivos en el directorio
	      const fileNames = await fs.readdir(directoryPath);
	
	      // Filtra los nombres de archivos JSON
	      const jsonFileNames = fileNames.filter((fileName) => path.extname(fileName) === '.json');
	
	      // Excluye un archivo específico (cambia 'archivo-excluido.json' al nombre real)
	      const excludedFileName = 'data.json';
	      const excludedFileNameTwo = 'data-lots.json';
	      const filteredFileNames = jsonFileNames.filter((fileName) => fileName !== excludedFileName);
	      filteredFileNames = filteredFileNames.filter((fileName) => fileName !== excludedFileNameTwo);
	
	      // Construye el objeto de respuesta
	      const responseObj = {
	        fileNames: filteredFileNames,
	      };
	
	      // Envía la respuesta como JSON
	      res.writeHead(200, { 'Content-Type': 'application/json' });
	      res.end(JSON.stringify(responseObj));
	    } catch (error) {
	      console.error(error);
	      res.writeHead(500, { 'Content-Type': 'text/plain' });
	      res.end('Internal Server Error');
	    }
	} else {
		res.statusCode = 404;
		res.end();
	}
});

server.listen(3000);