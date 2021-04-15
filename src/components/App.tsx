import {UIStore} from "../store/UIStore";
import {Marker, Popup, TileLayer, MapContainer, Polyline} from "react-leaflet";
import L, {LatLngExpression} from "leaflet";

import "leaflet/dist/leaflet.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

import {useEffect} from "react";

import {Badge, Card, CardColumns, Container} from "react-bootstrap";
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

const blackOptions = {color: 'black'};

export const App = (): JSX.Element => {
    const airportData = UIStore.useState(s => s.airport);
    const flightData = UIStore.useState(s => s.flight);

    useEffect(() => {
        console.log(airportData);
        console.log(flightData);
    });

    function getMapMarkers(): JSX.Element {
        return <>
            {
                airportData.map(airport => {
                    const airportPosition: LatLngExpression = [airport.lat, airport.lng];
                    return (
                        <Marker position={airportPosition} icon={DefaultIcon}>
                            <Popup>
                                <h4>
                                    {airport.name}
                                    <br/>
                                    <Badge variant="primary">{airport.ICAO}</Badge>
                                </h4>

                                {humanize.compactInteger(airport.passengers, 2)} passengers in 2019
                            </Popup>
                        </Marker>
                    );
                })
            }
        </>;
    }

    function getFlightLines(adepid: number, adesid: number): JSX.Element {
        const polyline: LatLngExpression[] = [
            [airportData[adepid].lat, airportData[adepid].lng],
            [airportData[adesid].lat, airportData[adesid].lng],
        ];

        return <>
            {
                <Polyline pathOptions={blackOptions} positions={polyline}/>
            }
        </>;
    }

    function listFlights(): JSX.Element {
        return <>
            {
                flightData.map(flight => {
                    const depTime = new Date( 1619845200000 + flight.depTime*1000);
                    const arrTime = new Date( 1619845200000 + flight.arrTime*1000);
                    return (
                        <Card>
                            <Card.Title style={{padding: "10px"}}>
                                <Badge variant="primary">{airportData[flight.adepid].ICAO}</Badge>
                                -
                                <Badge variant="success">{airportData[flight.adesid].ICAO}</Badge>
                            </Card.Title>

                            <Card.Body>
                                <small className="text-muted">
                                    <b>Departure:</b> {depTime.toLocaleTimeString('ro-RO')}
                                    <br />
                                    <b>Arrival:</b> {arrTime.toLocaleTimeString('ro-RO')}
                                </small>
                            </Card.Body>
                        </Card>
                    );
                })
            }
        </>;
    }

    return (
        <Container className="rounded border border-light entire-page">
            <Container fluid>
                <h2 className="section-title text-center m-5">Traffic Network Generator</h2>
            </Container>

            <MapContainer center={centerPosition} zoom={zoom} scrollWheelZoom={true} doubleClickZoom={false}
                          className="container p-3" style={{height: '800px'}}>
                <TileLayer
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {getMapMarkers()}
                {getFlightLines(45, 2)}
            </MapContainer>

            <Container fluid>
                <h4 className="section-title text-center m-5">Flight List</h4>
            </Container>
            <Container fluid>
                <CardColumns>
                    {listFlights()}
                </CardColumns>
            </Container>
        </Container>
    )
}
