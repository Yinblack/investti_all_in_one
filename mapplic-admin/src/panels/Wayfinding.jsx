import { forwardRef } from 'react'
import { Panel } from '../Panel'
import { AnimatePresence } from 'framer-motion'
import { AdminItems, AdminItemSingle } from '../AdminItems'
import { Key } from 'react-feather'
import { Switch, Input, Manual, Color } from '../AdminFields'
import { controlZones, TitleToggle, unique, filled, validClass, Conditional } from './utils'
import { roundTo } from '../../../mapplic/src/utils'
import useMapplicStore from '../../../mapplic/src/MapplicStore'


export const Wayfinding = forwardRef(({setOpened, updateSetting, updateList}, ref) => {
	const data = useMapplicStore(state => state.data);
	const layer = useMapplicStore(state => state.layer);

	const path = useMapplicStore(state => state.selectedVector);
	const setPath = useMapplicStore(state => state.setSelectedVector);

	const singlePath = (path, updateProperty) => (
		<div className="option-group">
			<Manual
				label="Id"
				value={path.id}
				onChange={val => updateProperty('id', val)}
				validate={val => unique(val, data?.routes, 'id') && filled(val) && validClass(val)}
				icon={<Key size={16} />}
				autoFocus
			/>
			<Switch label="Connect" value={path.connect || false} values={{true: 'Layer', false: 'Location'}} onChange={val => updateProperty('connect', val)} />
			<Input label="Endpoint" value={path.endpoint} placeholder="None" onChange={val => updateProperty('endpoint', val)} />
			<Input label="Weight" type="number" min="0" step="0.1" value={path.weight} suffix="X" placeholder="1" onChange={val => updateProperty('weight', val)} />
			<Switch label="Type" value={path.element || false} values={{polyline: 'Line', polygon: 'Shape'}} onChange={val => updateProperty('element', val)} />
			<Switch label="Inaccessible" value={path.inaccessible || false} onChange={val => updateProperty('inaccessible', val)} />
		</div>
	)

	if (!data.settings) return null;
	return (
		<Panel ref={ref}>
			<div className="panel-content">
				<div className="panel-inner">

					<div className="mapplic-panel-group">
						<TitleToggle title="Wayfinding" checked={data.settings.wayfinding} onChange={checked => updateSetting('wayfinding', checked)} back={() => setOpened(false)} />
						<Conditional active={data.settings.wayfinding || false}>
							<div className="mapplic-panel-options">
								<Switch label="Controls" value={data.settings.wayfindingControls} values={controlZones} onChange={val => updateSetting('wayfindingControls', val)} nullValue="" />
								<Switch label="By default" active={data.settings.wayfinding || false} value={data.settings.wayfindingOpened || false} values={{false: 'Closed', true: 'Opened'}} onChange={checked => updateSetting('wayfindingOpened', checked)} />
								<Input
									label="Line width"
									type="number"
									min="0"
									step="0.1"
									placeholder="3" 
									value={data.settings.wayfindingLineWidth}
									onChange={val => updateSetting('wayfindingLineWidth', parseFloat(val))}
									suffix="PT"
								/>
								<Color
									label="Line color"
									value={data.settings.wayfindingLineColor}
									onChange={color => updateSetting('wayfindingLineColor', color)}
									placeholder="Default"
									alpha={false}
								/>
								<Input
									label="Speed"
									type="number"
									min="0"
									placeholder="2"
									value={data.settings.wayfindingSpeed}
									onChange={val => updateSetting('wayfindingSpeed', parseFloat(val))}
									suffix="SEC"
								/>
								<Input
									label="Smoothing"
									type="number"
									min="0"
									placeholder="Disabled"
									value={data.settings.wayfindingSmoothing}
									onChange={val => updateSetting('wayfindingSmoothing', parseFloat(val))}
								/>
								<Input
									label="Fixed from"
									placeholder="None"
									value={data.settings.wayfindingFixedFrom}
									onChange={val => updateSetting('wayfindingFixedFrom', val)}
									icon={<Key size={16} />}
								/>
								<Switch label="Accessibility" value={data.settings.wayfindingAccessibility || false} values={{true: 'On', false: 'Off'}} onChange={checked => updateSetting('wayfindingAccessibility', checked)} />
							</div>
							<AutoLinker />
						</Conditional>
					</div>

					<div className="mapplic-panel-group">
						<AdminItems
							selected={path}
							setSelected={setPath}
							label={`Paths`}
							list={data?.routes}
							setList={val => updateList('routes', val)}
							newItem={{id: 'path' + Date.now()}}
							keyAttribute="id"
							nameAttribute="id"
						/>
					</div>

				</div>
			</div>
			<div className="panel-child">
				<AnimatePresence>
					{ path &&
						<AdminItemSingle
							list={data?.routes}
							setList={val => updateList('routes', val)}
							selected={path}
							setSelected={setPath}
							keyAttribute="id" 
							nameAttribute="id"
							render={singlePath}
						/>
					}
				</AnimatePresence>
			</div>
		</Panel>
	)
});

const AutoLinker = () => {
	const settings = useMapplicStore(state => state.data.settings);
	const routes = useMapplicStore(state => state.data.routes)
	const locations = useMapplicStore(state => state.data.locations);
	const layer = useMapplicStore(state => state.layer);
	const setData = useMapplicStore(state => state.setData);
	
	const handleClick = () => {
		const links = locations.filter(l => l.layer === layer).map(l => ({
			id: `p-${l.id}`,
			layer: layer,
			endpoint: l.id,
			element: 'polyline',
			points: `${roundTo(l.coord[0] * settings.mapWidth)},${roundTo(l.coord[1] * settings.mapHeight)}`
		}));

		setData({routes: [...routes, ...links]});
	}

	return (
		<button className="mapplic-button alt" onClick={handleClick}>Run autolink</button>
	)
}