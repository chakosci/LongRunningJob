import React, { Component } from 'react';
import axios from 'axios';
import * as signalR from '@microsoft/signalr';
import toastr from 'toastr';




export class Home extends Component {
    static displayName = Home.name;

    constructor(props) {
        super(props);
        this.state = {
            text: '',
            result: '',
            isEncoding: false,
            cancelToken: null,
            isConnecting: true,
            isConnected: false,
            hubConnection: null
        };
 




    }

    componentDidMount() {
        const hubConnection = new signalR.HubConnectionBuilder()
            .withUrl('/EncodingHub')
            .configureLogging(signalR.LogLevel.Information)
            .build();

        hubConnection.on('EncodedCharacter', (encodedChar) => {
            this.setState((prevState) => ({ result: prevState.result + encodedChar }));
        });

        hubConnection.start().then(() => {
            this.setState({ isConnecting: false, isConnected: true });
        }).catch((error) => {
            console.error(error);
            this.setState({ isConnecting: false, isConnected: false });
        });

        this.setState({ hubConnection });
    }

 

    //componentDidMount() {
    //    this.hubConnection.start()
    //        .then(() => console.log('SignalR Connected'))
    //        .catch(err => console.error('SignalR Connection Error: ', err));

    //    this.hubConnection.on('EncodedCharacter', (encodedChar) => {
    //        this.setState((prevState) => ({ result: prevState.result + encodedChar }));
    //    });

    //}

    //componentWillUnmount() {
    //    if (this.hubConnection) {
    //        this.hubConnection.stop();
    //    }
    //}




    handleConvert = async (event) => {
        event.preventDefault();
        this.setState({ result: '' });


        const { isEncoding, text, cancelToken } = this.state;

        if (isEncoding) {
            return;
        }
        this.setState({ isEncoding: true });
        const newCancelToken = axios.CancelToken.source();
        this.setState({ cancelToken: newCancelToken });

        try {
            const response = await axios.post('/Encoders/Post', { Value: text }, {
                cancelToken: newCancelToken.token,
            });
        } catch (error) {
            if (axios.isCancel(error)) {
                //this.setState({ result: 'Encoding is cancelled' });
                toastr.info('The operation was cancelled.');
            } else {
                toastr.danger('Encountered error!');
            }
        }

        this.setState({ isEncoding: false, cancelToken: null });
    };

    handleCancel = () => {
        const { cancelToken } = this.state;
        if (cancelToken) {
            cancelToken.cancel();

        }
    };

    handleTextChange = (event) => {
        this.setState({ text: event.target.value });
    };

    render() {
        const { text, result, isEncoding } = this.state;

        return (
            <div>
                <h1>Base64 Converter</h1>
                <form onSubmit={this.handleConvert}>
                    <label htmlFor="textToEncode" >
                        Text to encode:

                    </label>
                    <input id="textToEncode" type="text" className="form-control" value={text} onChange={this.handleTextChange} />

                    <div className="mt-1 mb-1">
                        <button className="btn btn-success " type="submit" disabled={isEncoding}>
                            Convert
                        </button>
                        <button className="btn btn-danger" type="button" onClick={this.handleCancel} disabled={!isEncoding}>
                            Cancel
                        </button>

                    </div>



                </form>
                <label htmlFor="textBase64Output" >Base64 Result:</label>
                <textarea className="form-control" value={result} readOnly={true} />

                {this.state.isConnecting && <p>Connecting to hub...</p>}
                {!this.state.isConnecting && !this.state.isConnected && <p>Failed to connect to hub.</p>}
                {this.state.isConnected && <p>Connected to hub.</p>}
            </div>
        );
    }


}
