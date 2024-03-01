import * as React from 'react';
import { useState } from 'react'
import useMapplicStore from './MapplicStore'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowUpRight , Phone, Clock } from 'react-feather'
import { RouteButton } from './Routes'
import { replaceVars } from './utils'
import classNames from 'classnames'

import Button from '@mui/material/Button';
import ChecklistIcon from '@mui/icons-material/Checklist';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

export const Popup = ({location, type}) => {
	const closeLocation = useMapplicStore(state => state.closeLocation);
	const settings = useMapplicStore(state => state.data.settings);

	const [details, setDetails] = useState(false);

  	const [open, setOpen] = React.useState(false);

  	const handleClickOpen = () => {
  	  setOpen(true);
  	};
  	const handleClose = () => {
  	  setOpen(false);
  	};

	function createData(plan, dscto, precio_m2, enganche, promo, precio_total, enganche_7dias, no_meses, monto_mensual) {
	  return { plan, dscto, precio_m2, enganche, promo, precio_total, enganche_7dias, no_meses, monto_mensual };
	}

	// const rows = [
	//   createData('Contado', '9%', '$7,862.39', '100%', 'Precio de Contado', '$2,047,916.72', '$2,047,916.72', '1', '$0.00'),
	//   createData('12 meses', '4%', '$8,294.39', '20%', 'Precio de 12 meses', '$2,160,439.76', '$432,087.95', '12', '$144,029.32'),
	//   createData('18 meses', '1.7%', '$8,493.11', '20%', 'Precio de 18 meses', '$2,212,200.36', '$442,440.07', '18', '$98,320.02'),
	//   createData('24 meses', '-', '$8,639.99', '25%', 'Precio de 24 meses', '$2,250,458.20', '$562,614.55', '24', '$70,326.82'),
	//   createData('36 meses', '-', '$9,028.79', '25%', 'Precio de 36 meses', '$2,351,728.93', '$587,932.23', '36', '$48,994.35')
	// ];
	const rows = [];
	if (location.precio_contado !== undefined && location.precio_contado!==null && ocation.precio_contado!=='') {
		var enganche = 100;
		var precio_mensualidad = 0;
	  rows.push(createData('Contado', location.dto_contado, location.precio_m2_contado, location.enganche_contado, 'Precio de contado', location.precio_contado, enganche+'%', 1, precio_mensualidad));
	}

	if (location.precio_6meses !== undefined && location.precio_6meses!==null && ocation.precio_6meses!=='') {
		var enganche = parseFloat(location.precio_6meses)*parseFloat(location.enganche_6meses);
		var precio_menos_enganche = parseFloat(location.precio_6meses) - enganche;
		var precio_mensualidad = precio_menos_enganche / 6;
	  rows.push(createData('6 meses', location.dto_6meses, location.precio_m2_6meses, location.enganche_6meses, 'Precio de 6 meses', location.precio_6meses, enganche+'%', 6, precio_mensualidad));
	}

	if (location.precio_12meses !== undefined && location.precio_12meses!==null && ocation.precio_12meses!=='') {
		var enganche = parseFloat(location.precio_12meses)*parseFloat(location.enganche_12meses);
		var precio_menos_enganche = parseFloat(location.precio_12meses) - enganche;
		var precio_mensualidad = precio_menos_enganche / 12;
	  rows.push(createData('12 meses', location.dto_12meses, location.precio_m2_12meses, location.enganche_12meses, 'Precio de 12 meses', location.precio_12meses, enganche+'%', 12, precio_mensualidad));
	}	

	if (location.precio_18meses !== undefined && location.precio_18meses!==null && ocation.precio_18meses!=='') {
		var enganche = parseFloat(location.precio_18meses)*parseFloat(location.enganche_18meses);
		var precio_menos_enganche = parseFloat(location.precio_18meses) - enganche;
		var precio_mensualidad = precio_menos_enganche / 18;
	  rows.push(createData('18 meses', location.dto_18meses, location.precio_m2_18meses, location.enganche_18meses, 'Precio de 18 meses', location.precio_18meses, enganche+'%', 18, precio_mensualidad));
	}

	if (location.precio_24meses !== undefined && location.precio_24meses!==null && ocation.precio_24meses!=='') {
		var enganche = parseFloat(location.precio_24meses)*parseFloat(location.enganche_24meses);
		var precio_menos_enganche = parseFloat(location.precio_24meses) - enganche;
		var precio_mensualidad = precio_menos_enganche / 24;
	  rows.push(createData('24 meses', location.dto_24meses, location.precio_m2_24meses, location.enganche_24meses, 'Precio de 24 meses', location.precio_24meses, enganche+'%', 24, precio_mensualidad));
	}

	if (location.precio_36meses !== undefined && location.precio_36meses!==null && ocation.precio_36meses!=='') {
		var enganche = parseFloat(location.precio_36meses)*parseFloat(location.enganche_36meses);
		var precio_menos_enganche = parseFloat(location.precio_36meses) - enganche;
		var precio_mensualidad = precio_menos_enganche / 36;
	  rows.push(createData('36 meses', location.dto_36meses, location.precio_m2_36meses, location.enganche_36meses, 'Precio de 36 meses', location.precio_36meses, enganche+'%', 36, precio_mensualidad));
	}

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

				{location.showButton !== undefined && location.showButton===true ?
					<Button variant="outlined" size="medium" endIcon={<ChecklistIcon />} onClick={handleClickOpen}>
					  PLANES DE PAGO
					</Button>
				:''}

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
      		<Dialog
      		  onClose={handleClose}
      		  aria-labelledby="customized-dialog-title"
      		  open={open}
      		  maxWidth="xl"
      		>
      		  <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
      		    {location.title}
      		  </DialogTitle>
      		  <IconButton
      		    aria-label="close"
      		    onClick={handleClose}
      		    sx={{
      		      position: 'absolute',
      		      right: 8,
      		      top: 8,
      		      color: (theme) => theme.palette.grey[500],
      		    }}
      		  >
      		    <CloseIcon />
      		  </IconButton>
      		  <DialogContent dividers>
    			<TableContainer component={Paper}>
    			  <Table sx={{ minWidth: 650 }} aria-label="simple table">
    			    <TableHead>
    			      <TableRow>
    			        <TableCell>Plan</TableCell>
    			        <TableCell align="right">Descuento</TableCell>
    			        <TableCell align="right">Precio Total m2</TableCell>
    			        <TableCell align="right">Enganche</TableCell>
    			        <TableCell align="right">Promoción Vigente</TableCell>
    			        <TableCell align="right">Precio Total</TableCell>
    			        <TableCell align="right">Enganche a los 7 días</TableCell>
    			        <TableCell align="right">Número de meses</TableCell>
    			        <TableCell align="right">Monto de mensualidades</TableCell>
    			      </TableRow>
    			    </TableHead>
    			    <TableBody>
    			      {rows.map((row) => (
    			        <TableRow
    			          key={row.plan}
    			          sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
    			        >
    			          <TableCell component="th" scope="row">
    			            {row.plan}
    			          </TableCell>
    			          <TableCell align="right">{row.dscto}</TableCell>
    			          <TableCell align="right">{row.precio_m2}</TableCell>
    			          <TableCell align="right">{row.enganche}</TableCell>
    			          <TableCell align="right">{row.promo}</TableCell>
    			          <TableCell align="right">{row.precio_total}</TableCell>
    			          <TableCell align="right">{row.enganche_7dias}</TableCell>
    			          <TableCell align="right">{row.no_meses}</TableCell>
    			          <TableCell align="right">{row.monto_mensual}</TableCell>
    			        </TableRow>
    			      ))}
    			    </TableBody>
    			  </Table>
    			</TableContainer>
      		  </DialogContent>
      		</Dialog>
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