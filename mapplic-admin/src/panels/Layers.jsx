import { useState, useEffect, forwardRef } from 'react'
import { Panel } from '../Panel'
import { AnimatePresence } from 'framer-motion'
import { AdminItems, AdminItemSingle } from '../AdminItems'
import { Switch, Input, Manual, Dropdown, Coord, Upload } from '../AdminFields'
import { Key } from 'react-feather'
import { controlZones, TitleToggle, unique, filled } from './utils'
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

export const Layers = forwardRef(({setOpened, updateSetting, updateList, saveMap, setJsonR}, ref) => {
	const [data, setData] = useState(useMapplicStore(state => state.data));

	const [layer, setLayer] = useState(false);

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
		formData.append('layer_id', id);
        publicServices.uploadCapaImage(formData)
        	.then(response => {
     			if (response.status===200) {
     				console.log('response===>');
     				console.log(response);
					const searchParams = new URLSearchParams(window.location.search);
					const map = searchParams.get('map');
     				setData(response.data.json);
     				setJsonR(response.data.json);
     				setOpenConfirm(false);
     			}
        	})
        	.catch(function (error) {
        	})
        	.then(function () {
        		setSelectedImg(null);
        	});
	}

	const getLayers = (empty = '(All layers)') => data?.layers?.reduce((acc, obj) => {
		acc[obj.id] = obj.name;
		return acc;
	}, {'': empty})

	const singleLayer = (layer, updateProperty) => (
		<div className="option-group">
			<Manual
				label="ID"
				value={layer.id}
				onChange={val => updateProperty('id', val)}
				validate={val => unique(val, data.layers, 'id') && filled(val)}
				icon={<Key size={16} />}
			/>
			<Input label="Nombre" value={layer.name} onChange={val => updateProperty('name', val)} autoFocus />
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
    		    <Button onClick={() => handleOk(layer.id)}>Continuar</Button>
    		  </DialogActions>
    		</Dialog>
		</div>
	)

	return (
		<Panel ref={ref}>
			<div className="panel-content">
				<div className="panel-inner">
					<div className="mapplic-panel-group">
						<AdminItems
							selected={layer}
							setSelected={setLayer}
							label="Capas"
							list={data.layers}
							setList={val => updateList('layers', val)}
							newItem={{id: 'layer' + Date.now(), name: 'New layer'}}
							keyAttribute="id"
							nameAttribute="name"
							back={() => setOpened(false)}
						/>
					</div>
					<div className="mapplic-panel-group">
						<h4>Opciones de capa</h4>
						<div className="mapplic-panel-options">
							<Manual label="Ancho" type="number" value={data.settings.mapWidth} onChange={val => updateSetting('mapWidth', parseFloat(val))} placeholder="REQURED" suffix="PX" />
							<Manual label="Alto" type="number" value={data.settings.mapHeight} onChange={val => updateSetting('mapHeight', parseFloat(val))} placeholder="REQURED" suffix="PX" />
							<Dropdown label="Default" values={getLayers('(First layer)')} value={data.settings.layer} onChange={val => updateSetting('layer', val)} />
							<Switch label="Selector" value={data.settings.layerSwitcher} values={controlZones} onChange={val => updateSetting('layerSwitcher', val)} nullValue="" />
						</div>
					</div>
					<div className="mapplic-panel-group">
						<TitleToggle title="Geocalibración" checked={data.settings.geo} onChange={checked => updateSetting('geo', checked)} />
						<Coord label="Extent" active={data.settings.geo || false} value={data.settings.extent} onChange={val => updateSetting('extent', val)} placeholder="min-lon, min-lat, max-lon, max-lat" />
					</div>
				</div>
			</div>
			<div className="panel-child">
				<AnimatePresence>
					{ layer &&
						<AdminItemSingle
							list={data.layers}
							setList={val => updateList('layers', val)}
							selected={layer}
							setSelected={setLayer}
							keyAttribute="id" 
							nameAttribute="name"
							render={singleLayer}
						/>
					}
				</AnimatePresence>
			</div>
		</Panel>
	)
});