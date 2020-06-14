const socket = io()

// elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = document.querySelector('#boxtext');
const $messageFormButton = document.querySelector('#msgbtn');

const $locationButton = document.querySelector('#send-location');

const $messages = document.querySelector('#messages');

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// Options
// Creates an object of url e.g. ?username=r_o_c_k&room=sofa
// object will contain username and room as properties
// to remove ? use ignoreQueryPrefix
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

/*
socket.on('countUpdated', (count) => {
    console.log('The count has been updated', count);
    
})

document.querySelector('#inc').addEventListener('click', () => {
    console.log('clicked');
    socket.emit('increment')
})
*/
 
// server(emit) --> client(receiver) -- acknowledgment --> server

// client(emit) --> server(receiver) -- acknowledgment --> client

const autoscroll = () => {
    //New msg element
    const $newMessage = $messages.lastElementChild;

    // height of the new msg
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;
    // offsetHeight does not take into account the margin


    // visible height
    const visibleHeight =  $messages.offsetHeight; // height of the scroller

    // height of msgs container
    const containerHeight = $messages.scrollHeight;

    //how far have i scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight;

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight;
    }
}


socket.on('welcome', (msg) => {
    //console.log(msg);
    
    // render template here.. in order to render a template u need
    // 1) u need template
    // 2) i need access to the place where i want to render the template

    // to render something to the browser 
    // is a 2 step process 
    // 1) compile our template with the data i want to render inside of it  


    // Mustache.render(require template as argument)
    const html = Mustache.render(messageTemplate,{
        username: msg.username,
        message: msg.text,
        createdAt: moment(msg.createdAt).format('h:mm a')
    });


    // beforeend: adds messages to buttom inside of the div
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
})

socket.on('locationMessage', (msg) => {
    //console.log(url);

    const html = Mustache.render(locationTemplate,{
        username: msg.username,
        liveLocation: msg.url,
        createdAt: moment(msg.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
})

socket.on('roomData', ({room, users}) => {
    
    //console.log(room);
    //console.log(users);
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html;
})







document.querySelector('#msgbtn').addEventListener('click', (event) => {
    event.preventDefault();

    // disable the submit btn       attribute name, value
    //$messageFormButton.setAttribute('disabled','disabled');

    enteredMsg = document.querySelector('#boxtext').value;

    socket.emit('sendMessage',enteredMsg, (error) => {
       
        // re-enable the submit btn
        //$messageFormButton.removeAttribute('disabled');

        // clearn input once msg has been sent
        $messageFormInput.value = '';
        $messageFormInput.focus();

        if(error){
            return console.log(error);
            
        }
        console.log('The message was deilvered!!');
        
    });
    // acknowledgment is the client getting notified that the event was received & processed
    // n the code that is going to run is provided as the last argument to emit
    // the fn next to enteredMsg is going to run wgen event is acknowledged
})


// browser geo-location API
document.querySelector('#send-location').addEventListener('click', () => {
    //The Geolocation API is accessed via a call to navigator.geolocation
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser')
    }    

 
    
    // disable btn
    $locationButton.setAttribute('disabled','disabled');

    // location can be fetched using
    // getCurrentPosition is aynchronous but unfortunately it does not support promise API
    // postion is an object
    navigator.geolocation.getCurrentPosition((position) => {

        socket.emit('sendLocation',{
            
            lat: position.coords.latitude,
            long: position.coords.longitude
        },(msg) => {
            $locationButton.removeAttribute('disabled'),
            console.log(msg);  
        })
    })
})

socket.emit('join', {username, room}, (error) => {
    if(error){
        alert(error);
        location.href = '/';    // to redirect to home page
    }
});
