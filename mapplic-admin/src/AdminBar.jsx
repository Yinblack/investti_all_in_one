import { useState, useEffect } from 'react'
import { CornerUpLeft, CornerUpRight, Code, Smartphone, Monitor, Tablet } from 'react-feather'
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { SaveButton } from './SaveButton'
import { Switch } from './AdminFields'
import { CodePopup } from './CodePopup'
import useMapplicStore from '../../mapplic/src/MapplicStore'
import { publicServices } from './services/publicServices';

export const AdminBar = ({history, view, setView, saveMap}) => {
	const data = useMapplicStore(state => state.data);
	const setData = useMapplicStore(state => state.setData);
	const source = useMapplicStore(state => state.source);
	const loading = useMapplicStore(state => state.loading);

	const [undos, setUndos] = useState([]);
	const [redos, setRedos] = useState([]);

	const [notif, setNotif] = useState(false);
	const [modified, setModified] = useState(false);
	const [saveState, setSaveState] = useState(false);

	const [codePopup, setCodePopup] = useState(false);

	const undo = () => {
		if (undos.length > 1) {
			const prev = undos[undos.length - 2];
			setData(prev);
			setUndos(undos.slice(0, -1));
			setRedos([undos[undos.length - 1], ...redos]);
			setModified(true);
		}
	}
	
	const redo = () => {
		if (redos.length > 0) {
			const next = redos[0];
			setData(next);
			setUndos([...undos, next]);
			setRedos(redos.slice(1));
			setModified(true);
		}
	}

	const jsonOutput = () => {
		// removoing chosen and selected added by ReactSortable
		const cleanArray = (a) => {
			if (!a) return [];
			return a.map(obj => {
				delete obj.chosen;
				delete obj.selected;
				return obj;
			});
		}

		return {
			...data,
			...(typeof source === 'string' && {target: source}),
			layers: cleanArray(data.layers),
			groups: cleanArray(data.groups),
			styles: cleanArray(data.styles),
			filters: cleanArray(data.filters),
			breakpoints: cleanArray(data.breakpoints),
			locations: cleanArray(data.locations),
			routes: cleanArray(data.routes)
		}	
	}

	const saveFile = (json) => {
        return publicServices.saveMap_(json)
        	.then(response => {
        	})
        	.catch(function (error) {
        	})
        	.then(function () {
        	});
	}

	const save = (json = jsonOutput()) => {
		if (!modified) return;	
		setSaveState('loading');
		setNotif(false);
		const savePromise = saveMap ? saveMap(json) : saveFile(json);

		savePromise.then(() => {
			setTimeout(() => {
				setSaveState('saved');
				setModified(false);
			}, 200);
		}).catch(error => {
			setNotif({ text: 'Error: connection refused!', type: 'error'});
			setSaveState(false);
			console.error('Error:', error);
		})
	}

	const logout = () => {
  		localStorage.clear();
        setTimeout(() => {
          window.location.reload();
        }, 500);
	}

	useEffect(() => { // history keyboard shortcuts
		const handleKeyDown = (e) => {
			if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.key === 'Z')) {
				if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
				if (!e.defaultPrevented) redo();
			}
			else if (e.ctrlKey && e.key === 'z') {
				if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
				if (!e.defaultPrevented) undo();
			}
			else if (e.ctrlKey && e.key === 's') {
				e.preventDefault();
				saveMap();
			}
		}
	
		document.addEventListener('keydown', handleKeyDown);
		return () => {
			document.removeEventListener('keydown', handleKeyDown);
		}
	}, [undos, redos, modified]);

	useEffect(() => { // history updates
		if (undos.length > 0) setModified(true);
		history >= 0 ? setUndos([...undos, data]) : setUndos([...undos.slice(0, -1), data]); // refresh the last step if history is negative 
		setRedos([]);
	}, [history, data.locations]);

	if (loading) return null;
	return (
		<div className="mapplic-admin-bar mapplic-admin-ui">
			<CodePopup open={codePopup} setOpen={setCodePopup} mode="json" title="Raw map data" content={jsonOutput()} setContent={setData} />
			<Notifications notif={notif} />

			<div></div>

			<Switch
				id="mapplic-screens"
				value={view}
				values={{desktop: <Monitor size={16} />, tablet: <Tablet size={16} />, mobile: <Smartphone size={16} />}}
				style={{width: 'auto'}}
				onChange={setView}
			/>

			<div className="mapplic-actions">
				<div>
					<button className="mapplic-admin-button" disabled={undos.length < 2} onClick={undo}><CornerUpLeft size={16} /></button>
					<button className="mapplic-admin-button" disabled={redos.length < 1} onClick={redo}><CornerUpRight size={16} /></button>
				</div>
				<button className="mapplic-button alt" style={{padding: 8}} onClick={() => setCodePopup(true)}><Code size={16}/></button>
				<SaveButton modified={modified} saveState={saveState} save={save} setNotif={setNotif}/>
				<Tooltip title="Cerrar sesión">
				  <IconButton size="small" onClick={() => logout()}>
				    <ExitToAppIcon />
				  </IconButton>
				</Tooltip>
			</div>
		</div>
	)
}

const Notifications = ({notif}) => {
	if (!notif) return;
	return (
		<div className="mapplic-admin-notifications">
			<p className={`mapplic-notification mapplic-${notif.type}`}>{notif.text}</p>
		</div>	
	)
}