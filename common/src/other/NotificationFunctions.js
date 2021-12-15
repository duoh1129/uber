import {
    cloud_function_server_url
} from 'config';

export function RequestPushMsg(token, title, msg) {
    fetch(`${cloud_function_server_url}/send_notification?token=${token}&title=${title}&msg=${msg}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then((response) => response.json())
    .then((responseJson) => {
        console.log(responseJson);
    })
    .catch((error) => {
        console.log(error)
    });
}