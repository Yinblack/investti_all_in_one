import { lazy, Suspense, useState, forwardRef } from 'react'
import { Panel } from '../Panel'
import { AnimatePresence } from 'framer-motion'
import { AdminItems, AdminItemSingle } from '../AdminItems'
import { Key, Crosshair } from 'react-feather'
import { Switch, Input, Manual, Dropdown, Upload, Color, Coord } from '../AdminFields'
import { TitleToggle, Tab, Conditional, locationTypes, locationActions, unique, filled } from './utils'
import Papa from 'papaparse'
import useMapplicStore from '../../../mapplic/src/MapplicStore'

import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import ImageIcon from '@mui/icons-material/Image';

import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Dialog from '@mui/material/Dialog';

import { publicServices } from '../services/publicServices';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const Editor = lazy(() => import('../Editor'));

const attributes = ['id', 'title', 'about', 'thumb', 'image', 'link', 'phone', 'hours', 'desc', 'color', 'style', 'label', 'scale', 'type', 'sample', 'layer', 'group', 'coord', 'latlon', 'zoom', 'action', 'hide', 'disable'];

export const Locations = forwardRef(({setOpened, updateSetting, updateList, setJsonR}, ref) => {


  	const [openConfirm, setOpenConfirm] = useState(false);
  	const [selectedImg, setSelectedImg] = useState(null);
   	const params = new URLSearchParams(window.location.search);

  	const handleFileChange = (event) => {
  	  const file = event.target.files[0];
  	  setSelectedImg(file);
  	  setOpenConfirm(true);
  	};
  	const handleUpload = (id) => {
  	  if (selectedImg) {
    	const name_json_file = params.get('map');
  	  	upload(selectedImg, name_json_file, id);
  	  } else {
  	    console.log('No se ha seleccionado ningún archivo');
  	  }
  	};
  	const handleOk = (id) => {
  	  handleUpload(id);
  	};
  	const handleClose = () => {
  	  setOpenConfirm(false);
  	};
  	const handleCancel = () => {
  	  handleClose();
  	  setSelectedImg(null);
  	  document.getElementById('fileInput').value = null;
  	};
	const upload = async (selectedImg, name_json_file, id) => {
		const formData = new FormData();
		formData.append('image', selectedImg);
		formData.append('name_json_file', name_json_file);
		formData.append('location_id', id);
        publicServices.uploadLocationImage(formData)
        	.then(response => {
     			if (response.status===200) {
     				setJsonR(response.data.json);
     			}
        	})
        	.catch(function (error) {
        	})
        	.then(function () {
        		setOpenConfirm(false);
        		setSelectedImg(null);
        	});
	}



	const data = useMapplicStore(state => state.data);
	const setData = useMapplicStore(state => state.setData);
	const csv = useMapplicStore(state => state.csv);
	const loc = useMapplicStore(state => state.location);
	const layer = useMapplicStore(state => state.layer);
	const estPos = useMapplicStore(state => state.estPos);

	const [location, setLocation] = useState(false);
	const [locationTab, setLocationTab] = useState('content');

	if (!data.locations) return null;

	const importCsv = () => {
		let ids = new Set(data?.locations?.map(l => l.id));
		setData({
			csv: [],
			settings: {
				...data.settings,
				csvEnabled: false,
				csv: ''
			},
			locations: [
				...data.locations,
				...csv.filter(l => !ids.has(l.id))
			]
		});
	}

	const exportCsv = () => {
		let csv = Papa.unparse(data.locations, { columns: getAllKeys()});
		window.open('data:text/csv;charset=utf-8,' + escape(csv));
	}

	const getStyles = (empty = '(Default)') => {
		const def = {'': empty};
		if (!data?.styles) return def;
		return data.styles.reduce((acc, obj) => {
			acc[obj.class] = obj.class;
			return acc;
		}, def);
	}

	const getGroups = () => data?.groups?.reduce((acc, obj) => {
		acc[obj.name] = obj.name;
		return acc;
	}, {});

	const getSamples = (initial = {}) => data?.locations?.reduce((acc, l) => {
		if (l.sample === 'true') acc[l.id] = l.title;
		return acc;
	}, initial);

	const getLayers = (empty = '(All layers)') => data?.layers?.reduce((acc, obj) => {
		acc[obj.id] = obj.name;
		return acc;
	}, {'': empty});

	const getAllKeys = () => Array.from(new Set(data?.locations.flatMap(Object.keys))).filter(key => !['chosen', 'selected'].includes(key));

	const customAttributes = () => getAllKeys().filter(key => !attributes.includes(key));

	const singleLocation = (location, updateProperty, sampled) => (
		<>
			<Switch value={locationTab} values={{content: 'Content', visual: 'Visual', function: 'Function'}} onChange={setLocationTab} />
			<Tab active={locationTab === 'content'} className="option-group">
				<Manual
					label="ID"
					value={location.id}
					onChange={val => updateProperty('id', val)}
					validate={val => unique(val, data.locations, 'id') && filled(val)}
					icon={<Key size={16} />}
				/>
				<Input label="Título" value={location.title} onChange={val => updateProperty('title', val)} autoFocus />
				<Input label="Acerca de" value={location.about} onChange={val => updateProperty('about', val)} placeholder={sampled?.about || 'Breve descripción'} />
				<Input label="Enlace" value={location.link} onChange={val => updateProperty('link', val)} placeholder="https://" />
				<Input label="Teléfono" value={location.phone} onChange={val => updateProperty('phone', val)} placeholder="Número de teléfono" />
				<Input label="Horario" value={location.hours} onChange={val => updateProperty('hours', val)} placeholder="Horario de apertura" />
				<Suspense fallback={<p>Cargando...</p>}>
					<Editor value={location.desc} onChange={val => updateProperty('desc', val)} placeholder={sampled?.desc?.replace(/<[^>]+>/g, '') || 'Descripción larga'} />
				</Suspense>
				{ customAttributes().map(a => <Input key={a} label={a} value={location[a]} onChange={val => updateProperty(a, val)} /> )}
    			<Button component="label" variant="contained" startIcon={<ImageIcon />}>
    			  Cargar imagén
    			  <VisuallyHiddenInput type="file" onChange={handleFileChange} id="fileInput"/>
    			</Button>
    			<Dialog
    			  sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }}
    			  maxWidth="xs"
    			  open={openConfirm}
    			>
    			  <DialogTitle>¿Deseas continuar?</DialogTitle>
    			  <DialogContent dividers>
    			  	<span>Esta opción reemplazara la imagen actual</span>
    			  </DialogContent>
    			  <DialogActions>
    			    <Button autoFocus onClick={handleCancel}>
    			      Cancelar
    			    </Button>
    			    <Button onClick={() => handleOk(location.id)}>Continuar</Button>
    			  </DialogActions>
    			</Dialog>
			</Tab>
			<Tab active={locationTab === 'visual'} className="option-group">
				<Color label="Color" value={location.color} onChange={val => updateProperty('color', val)} placeholder="Default" />
				<Dropdown label="Estilo" value={location.style} values={getStyles()} onChange={val => updateProperty('style', val)} />
				<Input label="Etiqueta" value={location.label} onChange={val => updateProperty('label', val)} placeholder="Marker text" />
				<Input label="Escala" type="number" min="0" step="0.1" value={location.scale} onChange={val => updateProperty('scale', parseFloat(val))} placeholder="1" />
				<Dropdown label="Tipo" value={location.type} values={locationTypes} onChange={val => updateProperty('type', val)} />
			</Tab>
			<Tab active={locationTab === 'function'} className="option-group">
				<Dropdown label="Ejemplo" value={location.sample} values={getSamples({'': '(None)', true: 'Usar como template'})} onChange={val => updateProperty('sample', val)} />
				<Dropdown label="Capa" value={location.layer} values={getLayers()} onChange={val => updateProperty('layer', val)} />
				<Dropdown label="Grupo" active={data?.groups || data.groups?.length > 0} value={location.group || []} multiple values={getGroups()} onChange={val => updateProperty('group', val)} />
				<Coord label="Coord" value={location.coord} onChange={val => updateProperty('coord', val)} icon={<Crosshair size={16} />} />
				<Coord label="Lat, lon" active={data.settings.geo} value={location.latlon} onChange={val => updateProperty('latlon', val)} icon={<Crosshair size={16} />} />
				<Input label="Zoom" type="number" min="0" step="0.1" value={location.zoom} onChange={val => updateProperty('zoom', parseFloat(val))} placeholder="Auto" />
				<Dropdown label="Acción" value={location.action}  values={locationActions} onChange={val => updateProperty('action', val)} />
				<Switch label="Visibilidad" value={location.hide || false} values={{false: 'Mostrar', true: 'Ocultar'}} onChange={val => updateProperty('hide', val)} />
				<Switch label="Deshabilitar" value={location.disable || false} values={{true: 'Si', false: 'No'}} onChange={val => updateProperty('disable', val)} />
			</Tab>
		</>
	)

	return (
		<Panel ref={ref}>
			<div className="panel-content">
				<div className="panel-inner">
					<div className="mapplic-panel-group" style={{gap: 24}}>
						<AdminItems
							selected={location}
							setSelected={setLocation}
							label="Ubicaciones"
							list={data.locations}
							setList={val => updateList('locations', val)}
							preselected={loc}
							def={{id:'def', title: 'Valores predeterminados', group:[], sample: 'true'}}
							newItem={{id: 'l' + Date.now(), title: 'Nueva ubicación', desc: 'Descripción.', coord: [0.5,0.5], layer: layer || false}}
							keyAttribute="id"
							nameAttribute="title"
							back={() => setOpened(false)}
							samples={true}
						/>

						<EstimatedCoordinates count={data.locations.filter(l => !l.coord && l.id in estPos).length} />
						<LocationRecognizer />
					</div>
					<div className="mapplic-panel-group">
						<TitleToggle title="CSV Externo" checked={data.settings.csvEnabled} onChange={checked => updateSetting('csvEnabled', checked)} />
						<Conditional active={data.settings.csvEnabled}>
							<Upload label="Archivo CSV" value={data.settings.csv} placeholder="Link CSV" onChange={(val) => updateSetting('csv', val)} button="true" />
							<div className="mapplic-panel-inline">
								<button className="mapplic-button alt" disabled={!data.settings.csv} onClick={importCsv}>Importar CSV</button>
								<button className="mapplic-button alt" disabled={data?.locations?.length < 1} onClick={exportCsv}>Exportar CSV</button>
							</div>
						</Conditional>
					</div>
				</div>
			</div>
			<div className="panel-child">
				<AnimatePresence>
					{ location &&
						<AdminItemSingle
							list={data.locations}
							setList={val => updateList('locations', val)}
							selected={location}
							setSelected={setLocation}
							keyAttribute="id" 
							nameAttribute="title"
							render={singleLocation}
							samples={true}
							def={location === 'def'}
						/>
					}
				</AnimatePresence>
			</div>
		</Panel>
	)
});

const EstimatedCoordinates = ({count}) => {
	const locations = useMapplicStore(state => state.data.locations);
	const setData = useMapplicStore(state => state.setData);
	const estPos = useMapplicStore(state => state.estPos);
	
	const saveEstimates = () => {
		setData({
			locations: locations.map(l => ({...l, ...estPos[l?.id]}))
		})
	}
	
	if (count < 1) return null;
	return (
		<p className="mapplic-notification mapplic-warning">
			<b>{count}</b> ubicaciones utilizan coordenadas estimadas. <button onClick={saveEstimates}>Haz clic aquí</button> para corregirlo.
		</p>
	)
}

const LocationRecognizer = () => {
	const estPos = useMapplicStore(state => state.estPos);
	const layer = useMapplicStore(state => state.layer);
	const data = useMapplicStore(state => state.data);
	const setData = useMapplicStore(state => state.setData);
	const csv = useMapplicStore(state => state.csv);

	const recognize = () => {
		const unlinked = Object.entries(estPos).filter(([k, v]) => data.locations.every(l => l.id !== k) && csv.every(l => l.id !== k) && v.layer === layer);

		if (unlinked.length < 1) alert('No hay elementos interactivos no vinculados en esta capa.');
		else if (confirm(`Hay ${unlinked.length} elementos interactivos no vinculados en esta capa. ¿Te gustaría autopopularlos?`)) {
			const newLocations = unlinked.map(l => ({id: l[0], title: l[0].toUpperCase(), ...l[1]}));
			setData({
				locations: [...newLocations, ...data.locations]
			});
		}
	}

	return <button className="mapplic-button alt" onClick={recognize}>Identificador automático</button>
}