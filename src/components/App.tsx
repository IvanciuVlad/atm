import { checkConflicts, Flight, UIStore } from "../store/UIStore";
import { FlightData } from "../store/UIStore";
import { TileLayer, MapContainer } from "react-leaflet";
import { LatLngExpression } from "leaflet";

import "leaflet/dist/leaflet.css";
import 'bootstrap/dist/css/bootstrap.min.css';

import { useEffect, useState } from "react";

import ScrollToTop from "./ScrollToTop";

import { Badge, Button, CardColumns, Container, InputGroup, ListGroup, ListGroupItem, FormControl, Form, FormGroup } from "react-bootstrap";
import { ArrowRight, Hourglass } from 'react-bootstrap-icons';
import '../styles/App.css';
import { RenderFlights } from "./RenderFlight";
import { RenderMarkers } from "./RenderMarkers";

// defining leaflet constants; values taken as it appears to cover most of europe
const centerPosition: LatLngExpression = [48.20, 16.30]
const zoom: number = 5;

const PER_PAGE = 45; // adjusts number of card showing flights per page

export const App = (): JSX.Element => {
    const airportData = UIStore.useState(s => s.airport);
    const flightData = UIStore.useState(s => s.flight);
    const [pagesData, setPagesData] = useState<FlightData[]>([])
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [currentFlight, setCurrentFlight] = useState<Flight>();

    const [timeInterval, setTimeInterval] = useState<number>(300)
    const [allConflicts, setAllConflicts] = useState(checkConflicts(300, flightData));

    useEffect(() => {
        //console.log(airportData);
        // console.log(flightData);
        //console.log(pagesData);
    }, [airportData, flightData, pagesData]);

    useEffect(() => {
        const data: FlightData[] = [];
        for (let idx = 0; idx < flightData.length; idx += PER_PAGE) {
            data.push(flightData.slice(idx, idx + PER_PAGE))
        }
        setPagesData(data)
    }, [flightData])

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

    /**
     * Lists flights present in the pagesData hook, enabling pagination
     */
    function listFlights(): JSX.Element {
        return <>
            {
                pagesData.length > 0 && pagesData[currentPage].map(flight => {
                    const depTime = new Date(1619845200000 + flight.depTime * 1000);
                    const arrTime = new Date(1619845200000 + flight.arrTime * 1000);

                    const isConflicted = allConflicts?.[flight.adesid].includes(flight) || false

                    return (
                        <ListGroup key={flight.id}>
                            <ListGroupItem action variant={isConflicted ? "danger" : "light"} onClick={() => setCurrentFlight(flight)}>
                                <Badge pill variant="primary">{airportData[flight.adepid].ICAO}</Badge>
                                <ArrowRight />
                                <Badge pill variant="success">{airportData[flight.adesid].ICAO}</Badge>
                                <small><b>: {flight.flightDistance} KM</b></small>
                                <br />
                                <small className="text-muted">
                                    <b>Departure:</b> {depTime.toLocaleTimeString('ro-RO')}
                                    <br />
                                    <b>Arrival:</b> {arrTime.toLocaleTimeString('ro-RO')}
                                </small>
                            </ListGroupItem>
                        </ListGroup>
                    );
                })
            }
        </>;
    }

    function showFlightPlan() {
        if (currentFlight)
            return <RenderFlights adepid={currentFlight.adepid} adesid={currentFlight.adesid}
                flightDistance={currentFlight.flightDistance} />
        else return <div>
        </div>;
    }

    return (
        <div>
            <Container className="rounded border border-light entire-page">
                <Container fluid>
                    <h2 className="section-title text-center m-5">Traffic Network Generator</h2>
                </Container>

                <MapContainer center={centerPosition} zoom={zoom} scrollWheelZoom={true} doubleClickZoom={false}
                    className="container p-3" style={{ height: '800px' }}>
                    <TileLayer
                        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <RenderMarkers />

                    {showFlightPlan()}
                </MapContainer>

                <Container fluid>
                    <h4 className="section-title text-center m-5">Flight List</h4>

                    <Container>
                        <Form className="m-4 l-4">
                            <FormGroup>
                                <label htmlFor="basic-addon1">Enter the time interval for conflict checking</label>
                                <InputGroup className="mb-3" style={{display: "flex"}}>
                                    <InputGroup.Prepend>
                                        <InputGroup.Text id="basic-addon1"><Hourglass /></InputGroup.Text>
                                    </InputGroup.Prepend>
                                    <FormControl
                                        type="number"
                                        onChange={(event) => { setTimeInterval(parseInt(event.target.value)) }}
                                        placeholder="In seconds"
                                        aria-label="timeInterval"
                                        aria-describedby="basic-addon1"
                                    />

                                    <InputGroup.Append>
                                        <Button variant="primary" type="submit" onClick={(event) => {
                                            event.preventDefault()
                                            setAllConflicts(checkConflicts(timeInterval, flightData))
                                        }}>
                                            Check
                                        </Button>
                                    </InputGroup.Append>
                                </InputGroup>
                            </FormGroup>

                        </Form>
                    </Container>

                    <div className="text-center" style={{ marginBottom: '10px' }}>
                        {renderPaginationButton()}
                    </div>
                </Container>
                <Container fluid>
                    <CardColumns>
                        {listFlights()}
                    </CardColumns>
                </Container>
            </Container>

            <ScrollToTop />
        </div>
    )
}
