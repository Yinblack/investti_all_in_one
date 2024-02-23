import { useState, forwardRef } from 'react'
import { Panel } from '../Panel'
import { AnimatePresence } from 'framer-motion'
import { AdminItems, AdminItemSingle } from '../AdminItems'
import { Key } from 'react-feather'
import { Switch, Input, Manual, Dropdown, Color } from '../AdminFields'
import { TitleToggle, Conditional, getGroups, unique, filled } from './utils'
import useMapplicStore from '../../../mapplic/src/MapplicStore'

export const Directory = forwardRef(({setOpened, updateSetting, updateList}, ref) => {
	const data = useMapplicStore(state => state.data);
	
	const [group, setGroup] = useState(false);
	const [filter, setFilter] = useState(false);

	const singleGroup = (group, updateProperty) => (
		<div className="option-group">
			<Manual
				label="Nombre"
				value={group.name}
				onChange={val => updateProperty('name', val)}
				validate={val => unique(val, data.groups, 'name') && filled(val)}
				icon={<Key size={16} />}
				autoFocus
			/>
			<Color label="Color" value={group.color} onChange={val => updateProperty('color', val)} />
			<Switch label="Oculto" value={group.hide || false} onChange={val => updateProperty('hide', val)} />
		</div>
	)

	const singleFilter = (filter, updateProperty) => (
		<div className="option-group">
			<Manual
				label="ID"
				value={filter.id}
				onChange={val => updateProperty('id', val)}
				validate={val => unique(val, data.filters, 'id') && filled(val)}
				icon={<Key size={16} />}
				autoFocus
			/>
			<Input label="Nombre" value={filter.name} onChange={val => updateProperty('name', val)} />
			<Dropdown label="Tipo" value={filter.type} values={{checkbox: 'Checkbox', tags: 'Grupos', dropdown: 'Dropdown'}} onChange={val => updateProperty('type', val)} />
			
			<Conditional active={filter.type === 'tags'}>
				<Dropdown label="Default" value={filter.default || []} multiple values={getGroups(data?.groups)} onChange={val => updateProperty('default', val)} />
			</Conditional>
		
			<Conditional active={filter.type === 'checkbox'} >
				<Manual label="Condition" value={filter.logic} onChange={val => updateProperty('logic', val)} />
				<Switch label="Default" value={filter.default || false} onChange={val => updateProperty('default', val)} />
			</Conditional>

			<Conditional active={filter.type === 'dropdown'} >
				<Manual label="Condition" value={filter.logic} onChange={val => updateProperty('logic', val)} />
				<Input label="Default" value={filter.default} onChange={val => updateProperty('default', val)} />
				<Input label="Value" value={filter.value} onChange={val => updateProperty('value', val)} />
			</Conditional>

			<Switch label="Deshabilitar" value={filter.disable || false} onChange={val => updateProperty('disable', val)} />
		</div>
	)

	return (
		<Panel ref={ref}>
			<div className="panel-content">
				<div className="panel-inner">
					<div className="mapplic-panel-group">
						<TitleToggle title="Directorio" checked={data.settings.sidebar} onChange={checked => updateSetting('sidebar', checked)} back={() => setOpened(false)} />
						<Conditional active={data.settings.sidebar || false}>
							<div className="mapplic-panel-options">
								<Switch label="Ordenar por título" value={data.settings.ordered || false} onChange={checked => updateSetting('ordered', checked)} />
								<Switch label="Agrupar" value={data.settings.groupBy || false} onChange={checked => updateSetting('groupBy', checked)} />
								<Switch label="Miniaturas" value={data.settings.thumbnails || false} onChange={checked => updateSetting('thumbnails', checked)} />
								<Switch label="Acordeon" value={data.settings.toggleSidebar || false} onChange={checked => updateSetting('toggleSidebar', checked)} />
								<Switch label="Por defecto" active={data.settings.toggleSidebar || false} value={data.settings.sidebarClosed} values={{false: 'Abierto', true: 'Cerrado'}} onChange={checked => updateSetting('sidebarClosed', checked)} />
								<Switch label="Sidebar" value={data.settings.rightSidebar || false} values={{false: 'Izquierda', true: 'Derecha'}} onChange={checked => updateSetting('rightSidebar', checked)} />
							</div>
						</Conditional>
					</div>

					<div className="mapplic-panel-group">
						<TitleToggle title="Busqueda y filtros" checked={data.settings.filters} onChange={checked => updateSetting('filters', checked)} />
						<Conditional active={data.settings.filters || false}>
							<div className="mapplic-panel-options">
								<Switch label="Visibilidad" active={data.settings.filters} value={data.settings.filtersAlwaysVisible || false} values={{false: 'Acordeon', true: 'Siempre'}} onChange={checked => updateSetting('filtersAlwaysVisible', checked)} />
								<Switch label="Por defecto" active={data.settings.filters} value={data.settings.filtersOpened || false} values={{true: 'Abierto', false: 'Cerrado'}} onChange={checked => updateSetting('filtersOpened', checked)} />
							</div>
						</Conditional>
					</div>

					<div className="mapplic-panel-group">
						<AdminItems
							selected={group}
							setSelected={setGroup}
							label="Grupos"
							list={data.groups}
							setList={val => updateList('groups', val)}
							newItem={{name: 'Group ' + Date.now(), color: '#111827'}}
							keyAttribute="name"
							nameAttribute="name"
							renderItem={(group, updateProperty) => (
								<div className="option-group">
									<Manual
										label="Nombre"
										value={group.name}
										onChange={val => updateProperty('name', val)}
										validate={val => unique(val, data.groups, 'name') && filled(val)}
										icon={<Key size={16} />}
									/>
									<Color label="Color" value={group.color} onChange={val => updateProperty('color', val)} />
									<Switch label="Oculto" value={group.hide || false} onChange={val => updateProperty('hide', val)} />
								</div>
							)}
						/>
					</div>

					<div className="mapplic-panel-group">
						<AdminItems
							selected={filter}
							setSelected={setFilter}
							label="Filtros personalizados"
							list={data.filters}
							setList={val => updateList('filters', val)}
							newItem={{id: 'f' + Date.now(), name: 'New filter', type: 'checkbox'}}
							keyAttribute="id"
							nameAttribute="name"
						/>
					</div>
				</div>
			</div>
			<div className="panel-child">
				<AnimatePresence>
					{ group &&
						<AdminItemSingle
							list={data.groups}
							setList={val => updateList('groups', val)}
							selected={group}
							setSelected={setGroup}
							keyAttribute="name" 
							nameAttribute="name"
							render={singleGroup}
						/>
					}
					{ filter &&
						<AdminItemSingle
							list={data.filters}
							setList={val => updateList('filters', val)}
							selected={filter}
							setSelected={setFilter}
							keyAttribute="id" 
							nameAttribute="name"
							render={singleFilter}
						/>
					}
				</AnimatePresence>
			</div>
		</Panel>
	)
});