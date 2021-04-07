import {Store} from "pullstate";
import data from '../data/airports2.json';


type AirportData = {
    id: number,
    name: string,
    ICAO: string,
    lat: number,
    lng: number,
    passengers: number
}[];

type UIStoreProps = {
    data: AirportData
}

export const UIStore = new Store<UIStoreProps>({
    data: (data as AirportData)
});
