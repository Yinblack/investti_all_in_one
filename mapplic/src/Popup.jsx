import { useState } from 'react'
import useMapplicStore from './MapplicStore'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowUpRight , Phone, Clock } from 'react-feather'
import { RouteButton } from './Routes'
import { replaceVars } from './utils'
import classNames from 'classnames'

export const Popup = ({location, type}) => {
	const closeLocation = useMapplicStore(state => state.closeLocation);
	const settings = useMapplicStore(state => state.data.settings);

	const [details, setDetails] = useState(false);

	return (
		<>
			{ location.image && (
				<div className="mapplic-popup-image">
					<img src={location.image} alt={location?.title} />
				</div>
			)}
			<div className="mapplic-popup-content">
				<button className="mapplic-popup-close" onClick={closeLocation}><X size={12}/></button>
				<div className="mapplic-popup-title">
					{ location.title && <h4>{location.title}</h4> }
					{ location.about && <h5 dangerouslySetInnerHTML={{__html: replaceVars(location, 'about')}}></h5> }
				</div>

				{ location?.desc && <div className="mapplic-popup-body" dangerouslySetInnerHTML={{__html: replaceVars(location)}}></div> }

				<Details location={location} field={details} />

				{ (location?.link || location?.hours || location?.phone || settings.wayfinding) && (
					<div className="mapplic-popup-footer">
						<div className="mapplic-popup-actions">
							{ settings.wayfinding && <RouteButton id={location.id} /> }
							<DetailButton location={location} field="phone" details={details} setDetails={setDetails}><Phone size={16} /></DetailButton>
							<DetailButton location={location} field="hours" details={details} setDetails={setDetails}><Clock size={16} /></DetailButton>
						</div>

						{ location.link &&
							<a href={location.link} style={{backgroundColor: location.color}} target="_blank" className="mapplic-button mapplic-button-primary" rel="noreferrer">
								{ settings.moreText || 'More' }
								<ArrowUpRight size={16}/>
							</a>
						}
					</div>
				)}
			</div>
		</>
	)
}

const Details = ({location, field}) => {
	return (
		<AnimatePresence mode="sync">
			{ field && (
				<motion.div className="mapplic-popup-details" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
					{ field === 'phone' && <a className="mapplic-phone" href={`tel:${location.phone}`}>{location.phone}</a> }
					{ field === 'hours' && <div className="mapplic-hours">{ location?.hours?.split(';').map((line, i) => <div key={i}>{line}</div>) }</div> }
				</motion.div> 
			)}
		</AnimatePresence>
	)
}

const DetailButton = ({location, field, details, setDetails, children}) => {
	if (!location[field]) return null;

	return (
		<button
			className={classNames('mapplic-button mapplic-button-icon', {'mapplic-active': details === field})}
			onClick={() => setDetails(prev => prev === field ? false : field )}
		>
			{ children }
		</button>
	)
}