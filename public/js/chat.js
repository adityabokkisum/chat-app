const socket=io()

const $messageForm=document.querySelector("#message-form");
const $messageFormInput=$messageForm.querySelector("input");
const $messageFormButton=$messageForm.querySelector("button");
const $locationSubmitButton=document.querySelector("#send-location")
const $messages=document.querySelector("#messages")

//templates
const messageTemplate=document.querySelector("#message-template").innerHTML;
const locationTemplate=document.querySelector("#location-template").innerHTML;
const sidebarTemplate=document.querySelector("#sidebar-template").innerHTML;

const autoScroll=()=>{
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on("message",(message)=>{
    const html=Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format("HH:mm")
    });
    $messages.insertAdjacentHTML("beforeend",html);
    autoScroll()
})
//options
const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true})



socket.on("locationMessage",(url)=>{
   const html=Mustache.render(locationTemplate,{
    username:url.username,
    url:url.url,
    createdAt:moment(url.createdAt).format("HH:mm")
   });
   $messages.insertAdjacentHTML("beforeend",html)
   autoScroll()
})

socket.on("roomData",({room,users})=>{
    const html=Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector("#sidebar").innerHTML=html;
})

$messageForm.addEventListener("submit",(e)=>{
    e.preventDefault();
 
    $messageFormButton.setAttribute("disable","disable");

    const text=e.target.elements.message.value;
    socket.emit("sendMessage",text,(error)=>{
        $messageFormButton.removeAttribute("disable");
        $messageFormInput.value="";
        $messageFormInput.focus();

        if(error){
          return  console.log(error);
        }
        console.log("The Message Delivered!");
    });
})

document.querySelector("#send-location").addEventListener("click",(e)=>{
   
    if(!navigator.geolocation){
        return alert("Geolocation is Not Supported By your Browser");
        
    }
    $locationSubmitButton.setAttribute("disable","disable");
    navigator.geolocation.getCurrentPosition((position)=>{
        let location={
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        }
        socket.emit("sendLocation",location,(message)=>{
            console.log(message);
        });
        $locationSubmitButton.removeAttribute("disable");
       

    })
})

socket.emit("join",{username,room},(error)=>{
    if(error){
        alert(error);
        location.href='/';
    }
})

