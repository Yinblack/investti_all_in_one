import { useState, useEffect } from 'react'
import { MapsModal } from './MapsModal'
import { Layers as LayerIcon, Folder, MapPin, Settings as SettingsIcon, Droplet, Map, Menu, Navigation } from 'react-feather'
import { AnimatePresence } from 'framer-motion'
import { Layers } from './panels/Layers'
import { Locations } from './panels/Locations'
import { Settings } from './panels/Settings'
import { Directory } from './panels/Directory'
import { Appearance } from './panels/Appearance'
import { Wayfinding } from './panels/Wayfinding'
import classNames from 'classnames'
import useMapplicStore from '../../mapplic/src/MapplicStore'

export const ControlPanel = ({updateHistory, action, title, state, saveMap, setJsonR}) => {

	const setAdmin = useMapplicStore(state => state.setAdmin);
	const data = useMapplicStore(state => state.data);
	const setData = useMapplicStore(state => state.setData);
	const location = useMapplicStore(state => state.location);
	const setRoutesEditing = useMapplicStore(state => state.setRoutesEditing);

	const [opened, setOpened] = useState(false);
	const [mapsModal, setMapsModal] = useState(false);

	useEffect(() => {
		setAdmin(true);
	}, []);

	useEffect(() => {
		if (location) setOpened('Locations');
	}, [location]);

	useEffect(() => {
		setRoutesEditing(opened === 'Wayfinding');
	}, [opened, setRoutesEditing]);

	const updateSetting = (setting, value = false, step = true) => {
		setData({
			settings: {
				...data.settings,
				[setting]: value
			}
		});
		updateHistory(step);
	}
	
	const updateList = (key, list, step = true) => {
		setData({
			[key]: list
		});
		updateHistory(step);
	}

	return (
		<aside>
			<div className="panel main">
				<div className="panel-content">
					<div className="main-panel-header">
						{ action 
							? ( <button onClick={action}><div className="mapplic-menu-icon"><Map size={16} /></div></button> )
							: (
							<>
								<MapsModal open={mapsModal} setOpen={setMapsModal} data={data}/>
								<button onClick={() => setMapsModal(true)}><div className="mapplic-menu-icon"><Map size={16} /></div></button>
							</>
							)
						}
						<span>{ title || 'Selecciona un mapa' }</span>
					</div>

					<div className="mapplic-panel-group" style={{padding: 12, border: 'none'}}>
						<div style={{display: 'flex', flexDirection: 'column', width: '100%', gap: 12}}>
							<MenuItem title="Capas" icon={<LayerIcon size={16} />} count={data?.layers?.length} opened={opened} setOpened={setOpened} error={data?.layers?.length < 1} />
							<MenuItem title="Ubicaciones" icon={<MapPin size={16} />} count={data?.locations?.length - 1} opened={opened} setOpened={setOpened} />
							<MenuItem title="Modulos" icon={<Folder size={16} />} opened={opened} setOpened={setOpened} />
							<MenuItem title="Configuración" icon={<SettingsIcon size={16} />} opened={opened} setOpened={setOpened} />
							<MenuItem title="Apariencia" icon={<Droplet size={16} />} opened={opened} setOpened={setOpened} />
							<MenuItem title="Wayfinding" icon={<Navigation size={16} />} opened={opened} setOpened={setOpened}/>
						</div>
					</div>
				</div>
				<div className="panel-child">
					<AnimatePresence mode="popLayout">
						{ opened === 'Capas' && <Layers key="Capas" setOpened={setOpened} updateSetting={updateSetting} updateList={updateList} updateHistory={updateHistory} setJsonR={setJsonR} /> }
						{ opened === 'Ubicaciones' && <Locations key="Ubicaciones" setOpened={setOpened} updateSetting={updateSetting} updateList={updateList} setJsonR={setJsonR} /> }
						{ opened === 'Modulos' && <Directory Key="Modulos" setOpened={setOpened} updateSetting={updateSetting} updateList={updateList} /> }
						{ opened === 'Configuración' && <Settings key="Configuración" setOpened={setOpened} updateSetting={updateSetting} updateList={updateList} setJsonR={setJsonR} /> }
						{ opened === 'Apariencia' && <Appearance key="Apariencia" setOpened={setOpened} updateSetting={updateSetting} updateList={updateList} /> }
						{ opened === 'Wayfinding' && <Wayfinding key="Wayfinding" setOpened={setOpened} updateSetting={updateSetting} updateList={updateList} /> }
					</AnimatePresence>
				</div>
			</div>
		</aside>
	)
}

const MenuItem = ({title, icon, count = false, disabled = false, opened, setOpened, error = false}) => {
	const handleClick = () => {
		if (disabled) return false;
		if (title === opened) setOpened(false);
		else setOpened(title);
	}

	return (
		<button className={classNames('mapplic-menu-button', {'mapplic-active': title === opened})} disabled={disabled} onClick={handleClick}>
			<div className="mapplic-menu-icon">
				{ error && <span className="mapplic-menu-warning">!</span> }
				{ icon }
			</div>
			<span>{title}</span>
			{ (count > 0 || typeof count === 'string') && <span className="mapplic-menu-count">{count}</span> }
		</button>
	)
}