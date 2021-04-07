import {UIStore} from "../store/UIStore";
import {Marker, Popup, TileLayer, MapContainer} from "react-leaflet";
import L, {LatLngExpression} from "leaflet";

import "leaflet/dist/leaflet.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

import {useEffect} from "react";

import {Badge, Container} from "react-bootstrap";
import '../styles/App.css';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [13, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const centerPosition: LatLngExpression = [48.20, 16.30]
const zoom: number = 5;

const humanize = require('humanize-plus');


export const App = (): JSX.Element => {
    const airportData = UIStore.useState(s => s.data);

    useEffect(() => {
        console.log(airportData[0]);
    });

    return (
        <Container className="entire-page" fluid>
            <div >
                <h2 className="section-title text-center m-5">Traffic Network Generator</h2>
            </div>

            <MapContainer center={centerPosition} zoom={zoom} scrollWheelZoom={true} doubleClickZoom={false} className="container p-3" style={{height: '800px'}}>
                <TileLayer
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {
                    airportData.map(airport => {
                        const airportPosition: LatLngExpression = [airport.lat, airport.lng];
                        return (
                            <Marker position={airportPosition} icon={DefaultIcon}>
                                <Popup>
                                    <h4>{airport.name}</h4>
                                    <Badge variant="primary">{airport.ICAO}</Badge>
                                    <p>{humanize.compactInteger(airport.passengers, 2)} passengers in 2019</p>
                                </Popup>
                            </Marker>
                        );
                    })
                }
            </MapContainer>
        </Container>
    )
}
