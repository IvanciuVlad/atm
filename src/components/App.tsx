import {UIStore} from "../store/UIStore";
import {FlightData} from "../store/UIStore";
import {Marker, Popup, TileLayer, MapContainer} from "react-leaflet";
import L, {LatLngExpression} from "leaflet";

import "leaflet/dist/leaflet.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

import {useEffect, useState} from "react";

import ScrollToTop from "./ScrollToTop";

import {Badge, Button, CardColumns, Container, ListGroup, ListGroupItem} from "react-bootstrap";
import { ArrowRight } from 'react-bootstrap-icons';
import '../styles/App.css';
import {RenderFlights} from "./RenderFlight";

// Icon needs to be added to leaflet, anchor must be set such that the marker point correctly at
// the coordinate when zoomed in
const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [13, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// defining leaflet constants; values taken as it appears to cover most of europe
const centerPosition: LatLngExpression = [48.20, 16.30]
const zoom: number = 5;

const humanize = require('humanize-plus');

const PER_PAGE = 45; // adjusts number of card showing flights per page

export const App = (): JSX.Element => {
    const airportData = UIStore.useState(s => s.airport);
    const flightData = UIStore.useState(s => s.flight);
    const [pagesData, setPagesData] = useState<FlightData[]>([])
    const [currentPage, setCurrentPage] = useState<number>(0);

    useEffect(() => {
        console.log(airportData);
        console.log(flightData);
        // console.log(pagesData)
    }, [airportData, flightData, pagesData]);

    useEffect(() => {
        const data: FlightData[] = [];
        for (let idx = 0; idx < flightData.length; idx += PER_PAGE) {
            data.push(flightData.slice(idx, idx + PER_PAGE))
        }
        setPagesData(data)
    }, [flightData])

    /**
     * Iterates through the airport array and displays a marker for each one with badge containing information
     */
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

    /**
     * Renders pagination buttons, guards are added such that redundant buttons are not shown at the beginning and end
     */
    function renderPaginationButton(): JSX.Element {
        return <>
            <div>
                <Button variant="outline-dark" onClick={() => setCurrentPage(0)}>1</Button>

                {
                    currentPage > 1 && (<Button variant="outline-dark"
                                                onClick={() => setCurrentPage(currentPage - 1)}> Prev {currentPage}</Button>)
                }

                {
                    currentPage > 0 && currentPage < pagesData.length - 1 && (<Button variant="outline-dark"
                                                                                      onClick={() => setCurrentPage(currentPage)}> Curr {currentPage + 1}</Button>)
                }

                {
                    currentPage < pagesData.length - 2 && (<Button variant="outline-dark"
                                                                   onClick={() => setCurrentPage(currentPage + 1)}> Next {currentPage + 2}</Button>)
                }


                <Button variant="outline-dark"
                        onClick={() => setCurrentPage(pagesData.length - 1)}>{pagesData.length}</Button>
            </div>
        </>;
    }

    function listFlights(): JSX.Element {
        return <>
            {
                pagesData.length > 0 && pagesData[currentPage].map(flight => {
                    const depTime = new Date(1619845200000 + flight.depTime * 1000);
                    const arrTime = new Date(1619845200000 + flight.arrTime * 1000);

                    return (
                      <ListGroup>
                          <ListGroupItem>
                              <Badge pill variant="primary">{airportData[flight.adepid].ICAO}</Badge>
                              <ArrowRight />
                              <Badge pill variant="success">{airportData[flight.adesid].ICAO}</Badge>
                              <small><b>: {flight.flightDistance} KM</b></small>
                              <br />
                              <small className="text-muted">
                                  <b>Departure:</b> {depTime.toLocaleTimeString('ro-RO')}
                                  <br/>
                                  <b>Arrival:</b> {arrTime.toLocaleTimeString('ro-RO')}
                              </small>
                          </ListGroupItem>
                      </ListGroup>
                    );
                })
            }
        </>;
    }

    return (
        <div>
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
                    <RenderFlights adepid={flightData[0].adepid}
                                   adesid={flightData[0].adesid}
                                   flightDistance={flightData[0].flightDistance} />
                </MapContainer>

                <Container fluid>
                    <h4 className="section-title text-center m-5">Flight List</h4>
                </Container>
                <Container fluid>
                    <div className="text-center" style={{marginBottom: '10px'}}>
                        {renderPaginationButton()}
                    </div>
                    <CardColumns>
                        {listFlights()}
                    </CardColumns>
                </Container>
            </Container>

            <ScrollToTop/>
        </div>
    )
}
