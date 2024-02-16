import { ArrowLeft, ArrowUpLeft, ArrowUpRight, ArrowDownRight, ArrowDownLeft, Minus, Plus } from 'react-feather'

export const controlZones = {
	'top-left': <ArrowUpLeft size={16} />,
	'top-right': <ArrowUpRight size={16} />,
	'bottom-left': <ArrowDownLeft size={16} />,
	'bottom-right': <ArrowDownRight size={16} />
}

export const locationTypes = {
	'': '(Predeterminado)',
	'hidden': 'Oculto',
	'circle': 'Círculo',
	'dot': 'Punto',
	'square': 'Cuadrado',
	'rounded': 'Redondeado',
	'pin1': 'Pin 1',
	'pin2': 'Pin 2',
	'thumb': 'Miniatura',
	'text': 'Texto'
}

export const locationActions = {
	'': '(Default)',
	tooltip: 'Tooltip',
	none: 'Hacer nada',
	sidebar: 'PopUp lateral',
	link: 'Abrir enlace'
}

export const unique = (value, list, key) => {
	const valid = !list.some(i => i[key].toLowerCase() === value.toLowerCase());
	if (!valid) throw Error(key.toUpperCase() + ' debe ser único!');
	return valid;
}

export const filled = (value) => {
	if (!value) throw Error('Este campo no puede estar vacío!');
	return value;
}

export const validClass = (value) => {
	if (!/^[a-zA-Z]/.test(value)) throw new Error('No puede comenzar con un número');
	if (/\s/.test(value)) throw new Error('No puede contener espacios');
	if (!/^[a-zA-Z0-9_-]+$/.test(value)) throw new Error('No puede contener caracteres especiales aparte de guion bajo (_) o guion (-).');
	return value;
}

export const getGroups = (groups) => groups.reduce((acc, obj) => {
	acc[obj.name] = obj.name;
	return acc;
}, {});

export const TitleToggle = ({title, checked, onChange, back}) => {
	return (
		<div className="mapplic-title-toggle" style={{marginBottom: checked ? 0 : -10}}>
			<div style={{display: 'flex', alignItems: 'center', gap: 4, marginLeft: back ? -8 : 0}}>
				{ back && <button className="mapplic-admin-button" onClick={back}><ArrowLeft size={16} /></button> }
				<h4>{ title }</h4>
			</div>
			<button className="mapplic-admin-button" onClick={() => onChange(!checked)}>
				{ checked ? <Minus size={16} /> : <Plus size={16} /> }
			</button>
		</div>
	)
}

export const Tab = ({active, children, ...props}) => {
	if (!active) return null;
	return (
		<div {...props}>
			{ children }
		</div>
	)
}

export const Conditional = ({active = false, children}) => {
	if (!active) return null;
	return children;
}