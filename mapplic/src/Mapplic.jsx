import ReactDOM from 'react-dom/client'
import MapplicElement from './MapplicElement'
import { MapplicStore } from './MapplicStore'

const Mapplic = ({json = 'data.json', id, ...props}) => {
	return (
		<MapplicStore>
			<MapplicElement json={json} {...props}/>
		</MapplicStore>
	)
}

export default Mapplic

// web component
class MapplicWebComponent extends HTMLElement {
	constructor() {
		super();
		this._root = this.attachShadow({ mode: 'closed' });
	}
	
	connectedCallback() {
		if (this._root.childElementCount > 0) return;
		
		let path = './';
		const script = document.getElementById('mapplic-script');
		if (script) path = script.src.substring(0, script.src.lastIndexOf('/') + 1);

		const linkElement = document.createElement('link');
		linkElement.setAttribute('rel', 'stylesheet');
		linkElement.setAttribute('type', 'text/css');
		linkElement.setAttribute('href', path + 'mapplic.css');
		this._root.appendChild(linkElement);
		
		const props = this.dataset;
		
		ReactDOM.createRoot(this._root).render(
			<MapplicStore>
				<MapplicElement json={props.json} {...props} />
			</MapplicStore>
		);
	}
}

customElements.define('mapplic-map', MapplicWebComponent);