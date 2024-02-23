import { useState, forwardRef } from 'react'
import { Panel } from '../Panel'
import { AnimatePresence } from 'framer-motion'
import { AdminItems, AdminItemSingle } from '../AdminItems'
import { ArrowLeft, Key } from 'react-feather'
import { Switch, Input, Manual, Dropdown } from '../AdminFields'
import Button from '@mui/material/Button';
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import { controlZones, TitleToggle, unique, filled, validClass, Conditional } from './utils'
import useMapplicStore from '../../../mapplic/src/MapplicStore'

import { publicServices } from '../services/publicServices';

export const Settings = forwardRef(({setOpened, updateSetting, updateList, setJsonR}, ref) => {
	const data = useMapplicStore(state => state.data);
	const setTransition = useMapplicStore(state => state.setTransition);
	const setTarget = useMapplicStore(state => state.setTarget);

	const params = new URLSearchParams(window.location.search);
	const name_json_file = params.get('map');

	const [breakpoint, setBreakpoint] = useState(false);

	const sync = async () => {
        publicServices.syncMap(name_json_file)
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

	const singleBreakpoint = (breakpoint, updateProperty) => (
		<div className="option-group">
			<Manual
				label="Nombre"
				value={breakpoint.name}
				onChange={val => updateProperty('name', val)}
				validate={val => unique(val, data?.breakpoints, 'name') && filled(val) && validClass(val)}
				icon={<Key size={16} />}
				autoFocus
			/>
			<Input label="Debajo" type="number" value={breakpoint.below} min="1" onChange={val => updateProperty('below', parseFloat(val))} suffix="PX" />
			<Switch label="Portrait" value={breakpoint.portrait || false} onChange={val => updateProperty('portrait', val)} />
			<Input label="Sidebar" type="number" active={!breakpoint.portrait} value={breakpoint.sidebar} min="1" placeholder="Default" onChange={val => updateProperty('sidebar', parseFloat(val))} suffix="W" />
			<Dropdown label="Tipo" value={breakpoint.type} values={{list: 'List', grid: 'Grid'}} onChange={val => updateProperty('type', val)} />
			<Input label="Columna" type="number" value={breakpoint.column} min="1" placeholder="1" onChange={val => updateProperty('column', parseInt(val))} suffix="NR" />
			<Input label="Contenedor" type="number" value={breakpoint.container} min="1" placeholder="Auto" onChange={val => updateProperty('container', parseFloat(val))} suffix="H" />
			<Input label="Elemento" active={breakpoint.portrait} type="number" value={breakpoint.element} min="1" placeholder="Auto" onChange={val => updateProperty('element', parseFloat(val))} suffix="H" />
		</div>
	)

	return (
		<Panel ref={ref}>
			<div className="panel-content">
				<div className="panel-inner">
					<div className="mapplic-panel-group">
						<div style={{display: 'flex', alignItems: 'center', gap: 4, marginLeft: -8, marginTop: -8}}>
							<button className="mapplic-admin-button" onClick={() => setOpened(false)}><ArrowLeft size={16} /></button>
							<h4>Configuración</h4>
						</div>
						<div className="mapplic-panel-options">
							<Switch label="Icono FullScreen" value={data.settings.fullscreen} values={controlZones} onChange={val => updateSetting('fullscreen', val)} nullValue="" />
							<Switch label="Tooltipe en hover" value={data.settings.hoverTooltip} onChange={checked => updateSetting('hoverTooltip', checked)} />
							<Switch label="Descripción en hover" active={data.settings.hoverTooltip} value={data.settings.hoverAbout || false} onChange={checked => updateSetting('hoverAbout', checked)} />
							<Switch label="Deeplinking" value={data.settings.deeplinking || false} onChange={checked => updateSetting('deeplinking', checked)} />
							<Input label="Padding" type="number" min="0" value={data.settings.padding} suffix="PX" onChange={(val, step) => updateSetting('padding', parseFloat(val), step)} placeholder="0" />
							<Switch label="Accessibilidad" value={data.settings.accessibility || false} values={{true: 'Plus', false: 'Normal'}} onChange={val => updateSetting('accessibility', val)}/>
							<Input label="URL de sincronización" type="text" value={data.settings.import_url} onChange={(val) => updateSetting('import_url', val)} />
							<Button variant="outlined" startIcon={<CloudSyncIcon />} onClick={() => {sync();}}>
							  Sincronizar
							</Button>
						</div>
					</div>

					<div className="mapplic-panel-group">
						<AdminItems
							selected={breakpoint}
							setSelected={setBreakpoint}
							label="Responsividad"
							list={data.breakpoints}
							setList={val => updateList('breakpoints', val)}
							def={{name: 'all-screens', below: 8000}}
							newItem={{name: 'breakpoint' + Date.now()}}
							keyAttribute="name"
							nameAttribute="name"
						/>
					</div>

					<div className="mapplic-panel-group">
						<TitleToggle title="Zoom y mouse" checked={data.settings.zoom} onChange={checked => updateSetting('zoom', checked)} />
						<Conditional active={data.settings.zoom}>
							<div className="mapplic-panel-options">
								<Input
									label="Zoom máximo"
									type="number"
									min="1"
									value={data.settings.maxZoom}
									onChange={(val, step) => {
										const safeVal = Math.max(parseFloat(val), 1);
										updateSetting('maxZoom', safeVal, step);
										setTransition({duration: 0.4});
										setTarget({scale: safeVal});
									}}
								/>
								<Switch label="Botón de resetear" value={data.settings.resetButton} values={controlZones} onChange={val => updateSetting('resetButton', val)} nullValue="" />
								<Switch label="Botón de zoom" value={data.settings.zoomButtons} values={controlZones} onChange={val => updateSetting('zoomButtons', val)} nullValue="" />
								<Switch label="Mousewheel" value={data.settings.mouseWheel} onChange={checked => updateSetting('mouseWheel', checked)} />
							</div>
						</Conditional>
					</div>

					<div className="mapplic-panel-group">
						<h4>Traducciones</h4>
						<div className="mapplic-panel-options">
							<Input label="Botón" value={data.settings.moreText} onChange={val => updateSetting('moreText', val)} placeholder="Más" />
							<Input label="Buscar" value={data.settings.searchText} onChange={val => updateSetting('searchText', val)} placeholder="Buscar" />
							<Input label="Borrar todo" value={data.settings.clearText} onChange={val => updateSetting('clearText', val)} placeholder="Borrar todo" />
						</div>
					</div>
				</div>
			</div>
			<div className="panel-child">
				<AnimatePresence>
					{ breakpoint &&
						<AdminItemSingle
							list={data.breakpoints}
							setList={val => updateList('breakpoints', val)}
							selected={breakpoint}
							setSelected={setBreakpoint}
							keyAttribute="name" 
							nameAttribute="name"
							render={singleBreakpoint}
							def={breakpoint === 'all-screens'}
						/>
					}
				</AnimatePresence>
			</div>
		</Panel>
	)
});