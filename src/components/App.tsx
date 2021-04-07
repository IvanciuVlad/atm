import {UIStore} from "../store/UIStore";
import {Marker, Popup, TileLayer, MapContainer} from "react-leaflet";
import L, {LatLngExpression} from "leaflet";

import "leaflet/dist/leaflet.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

import {useEffect} from "react";

import {Badge, Container} from "react-bootstrap";

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [13, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const centerPosition: LatLngExpression = [48.20, 16.30]
const zoom: number = 5;


export const App = (): JSX.Element => {
    const airportData = UIStore.useState(s => s.data);

    useEffect(() => {
        console.log(airportData[0]);
    });

    return (
        <Container fluid>
            <div >
                <h3 className="section-title text-center m-5">Traffic Network Generator</h3>
            </div>

            <MapContainer center={centerPosition} zoom={zoom} scrollWheelZoom={false} className="container" style={{height: '800px'}}>
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
                                    <p>Number of passengers in 2019: {airport.passengers}</p>
                                </Popup>
                            </Marker>
                        );
                    })
                }
            </MapContainer>
        </Container>
    )
}
