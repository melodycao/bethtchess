import React, { useCallback, useEffect, useRef, useState } from 'react';
import Webcam from "react-webcam";
import 'fomantic-ui/dist/semantic.min.css'

const WebcamComponent = () => {
    const countdown = 3;

    const webcamRef = useRef( null );

    const [seconds, setSeconds] = useState( countdown );
    const [isTimerActive, setTimerActive] = useState( false );

    let id = 0;

    const capture = useCallback(
        ( path, options ) => {
            const imageSrc = webcamRef.current.getScreenshot();
            const uploadImage = async ( image ) => {
                const formData = new FormData();
                console.log( id )
                if ( id >= 6 ) {
                    id = 0;
                }
                id++;
                //const id = Math.random().toString( 36 ).substr( 2, 9 );


                let arr = image.split( ',' ), mime = arr[ 0 ].match( /:(.*?);/ )[ 1 ],
                    bstr = atob( arr[ 1 ] ), n = bstr.length, u8arr = new Uint8Array( n );
                while ( n-- ) {
                    u8arr[ n ] = bstr.charCodeAt( n );
                }

                const file = new File( [u8arr], id + ".jpg", { type: mime } );
                formData.append( "picture", file );

                const res = await fetch( "http://localhost:4000/picture", {
                    method: "POST",
                    body: formData
                } ).then( res => res.json() );
                console.log( JSON.stringify( res ) );

                const response = await fetch( "http://localhost:4000/analyze", {
                    method: "POST",
                    body: formData
                } ).then( response => response.json() );
                console.log( JSON.stringify( response ) );
            }

            uploadImage( imageSrc ).then( r => {
                console.log( r );
            } )
        },
        []
    );


    useEffect( () => {
        const intervals = [];
        if ( isTimerActive ) {
            // 3sec timer
            intervals.push( setInterval( () => {
                setSeconds( seconds => seconds - 1 );
            }, 1000 ) );

            // take pictures
            intervals.push( setInterval( () => {
                capture();
            }, 500 ) );
        } else if ( !isTimerActive && seconds === 0 ) {
            intervals.map( interval => (
                clearInterval( interval )
            ) )
        }

        if ( seconds === 0 ) {
            setSeconds( countdown );
            setTimerActive( false );
        }

        return () => (
            intervals.map( interval => (
                clearInterval( interval )
            ) )
        );
    }, [capture, isTimerActive, seconds] );


    return (
        <div>
            <div id="headerSegment" className="ui rounded inverted segment"
                 style={ {
                     position: 'center',
                     width: '850px',
                     alignItems: 'center',
                     alignSelf: 'center',
                     color: '#204229',
                     display: 'block',
                     marginLeft: 'auto',
                     marginRight: 'auto',
                 } }>
                <h1 className="ui header">
                    BethChess.tech
                </h1>
            </div>

            <Webcam
                audio={ false }
                ref={ webcamRef }
                screenshotFormat="image/jpeg"
                height={720}
                width={1080}
            />
            <div>
                { !isTimerActive ?
                    <button
                        className="ui inverted animate teal labeled icon button"
                        onClick={ () => setTimerActive( !isTimerActive ) }>
                        <i className="camera icon"/>
                        Capture
                    </button> :
                    <button
                        className="ui inverted disabled animate teal labeled icon button">
                        <i className="camera icon"/>
                        { seconds }
                    </button>
                }
            </div>
            <div className="row" style={ { background_color: '#869D05', color: '#FFFFFF' } }>
                <div className="column">
                    {/*{ image && (*/ }
                    {/*    <div>*/ }
                    {/*        <div>*/ }
                    {/*            <button className="ui inverted animate green labeled icon button" onClick={ capture }>*/ }
                    {/*                <i className="download icon"/>*/ }
                    {/*                Analyze*/ }
                    {/*            </button>*/ }
                    {/*        </div>*/ }
                    {/*        <img*/ }
                    {/*            src={ image }*/ }
                    {/*            alt="img"/>*/ }
                    {/*    </div>*/ }
                    {/*) }*/ }
                </div>
            </div>
        </div>
    );
};

export default WebcamComponent;
