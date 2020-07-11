//user reciever
const socket = io();
//Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = document.querySelector('input');
const $messageFormButton = document.querySelector('button');
const $sendLocation = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');

// socket.on('countUpdated', (count) => {
//   console.log('the count has been updated!', count);
// });
// //user transmitter
// document.querySelector('#increment').addEventListener('click', () => {
//   console.log('clicked');
//   socket.emit('increment');
// });
//task

//templete
const messageTemplete = document.querySelector('#message-templete').innerHTML;
const locationTemplete = document.querySelector('#location-templete').innerHTML;
const sidebarTemplete = document.querySelector('#sidebar-template').innerHTML;
//options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoScroll = () => {
  //new message element
  const $newMessage = $messages.lastElementChild
  //height of the new messages
  const newMessageStyles = getComputedStyle($newMessage)
  const newMessageMargin = parseInt(newMessageStyles.marginBottom)
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
  //visible height
  const visibleHeight = $messages.offsetHeight
  // Height of messages containar
  const containerHeight = $messages.scrollHeight
  //how far have i scrolled ?
  const scrollOfset = $messages.scrollTop + visibleHeight
  if (containerHeight - newMessageHeight <= scrollOfset) {
    $messages.scrollTop = $messages.scrollHeight
  }
}

//user reciever
socket.on('message', (message) => {
  console.log(message);
  const html = Mustache.render(messageTemplete, {
    username: message.username,
    message: message.text,
    creatAt: moment(message.creatAt).format('h:mm a'),
  });
  $messages.insertAdjacentHTML('beforeend', html);
  autoScroll()
});
//recieve locationn
socket.on('locationMessage', (loc) => {
  console.log(loc);
  const html = Mustache.render(locationTemplete, {
    username: loc.username,
    url: loc.url,
    creatAt: moment(loc.creatAt).format('h:mm a'),
  });
  $messages.insertAdjacentHTML('beforeend', html);
  autoScroll()
});
socket.on('roomData', ({ room, users }) => {
  const html = Mustache.render(sidebarTemplete, {
    room,
    users
  });
  document.querySelector('#sidebar').innerHTML = html

})


//user transmitter
$messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  $messageFormButton.setAttribute('disabled', 'disabled');

  const message = e.target.elements.message.value;
  socket.emit('send mesage', message, (error) => {
    $messageFormButton.removeAttribute('disabled');
    $messageFormInput.value = '';
    $messageFormInput.focus();
    if (error) {
      return console.log(error);
    }
    console.log('the message delivred');
  });
});
//know the location
$sendLocation.addEventListener('click', () => {
  if (!navigator.geolocation) {
    return alert('geo location is not supporting');
  }
  $sendLocation.setAttribute('disabled', 'disabled');
  //transmit location
  navigator.geolocation.getCurrentPosition((position) => {
    const info = {
      long: position.coords.longitude,
      lat: position.coords.latitude,
    };
    socket.emit('location', info, () => {
      $sendLocation.removeAttribute('disabled');
      console.log('location shared');
    });

    // console.log(info);
  });
});
socket.emit('join', { username, room }, (error) => {
  if (error) {
    alert(error)
    location.href = '/'
  }
});
