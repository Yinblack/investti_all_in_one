import { useEffect } from 'react'
import Papa from 'papaparse'
import useMapplicStore from './MapplicStore'

export const useDataLoader = (json) => {
	const fetchData = useMapplicStore(state => state.fetchData);
	const fetchCsv = useMapplicStore(state => state.fetchCsv);
	const setCsv = useMapplicStore(state => state.setCsv);
	const settings = useMapplicStore(state => state.data.settings);
	useMapplicStore(state => state.csv);

	// fetch json
	useEffect(() => {
		if (json) fetchData(json);
	}, [json, fetchData]);

	// fetch csv
	useEffect(() => {
		if (settings?.csvEnabled && settings?.csv) fetchCsv(
			new Promise((resolve, reject) => {
				Papa.parse(settings?.csv, {
					header: true,
					download: true,
					encoding: 'UTF-8',
					skipEmptyLines: true,
					transformHeader: (h) => { return h.trim().toLowerCase(); },
					transform: (val, col) => {
						if (col === 'coord') return val.split(',').map(parseFloat);
						if (col === 'latlon') return val.split(',').map(parseFloat);
						return val;
					},
					complete: (results) => {
						resolve(results.data);
					},
					error: (err) => {
						reject(err);
					}
				});
			})
		);
		else setCsv([]);
	}, [settings?.csv, settings?.csvEnabled, fetchCsv, setCsv]);
}