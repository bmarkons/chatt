// NOTE: The contents of this file will only be executed if
// you uncomment its entry in "web/static/js/app.js".

// To use Phoenix channels, the first step is to import Socket
// and connect at the socket path in "lib/my_app/endpoint.ex":
import {Socket} from "deps/phoenix/web/static/js/phoenix"

let socket = new Socket("/socket")

class App {

  static init(){
    let socket = new Socket("/socket", {
      logger: ((kind, msg, data) => { console.log(`${kind}: ${msg}`, data) })
    })

    socket.connect({user_id: "123"})
    var $status    = $("#status")
    var $messages  = $("#messages")
    var $input     = $("#message-input")
    var $form      = $("#chat-form")
    var $username  = $("#username")
    var room_id    = $("#room_id").val()

    socket.onOpen( ev => console.log("OPEN", ev) )
    socket.onError( ev => console.log("ERROR", ev) )
    socket.onClose( e => console.log("CLOSE", e))

    var chan = socket.channel("rooms:lobby", {})
    chan.join().receive("ignore", () => console.log("auth error"))
    .receive("ok", () => { console.log("join ok")
                           $messages.append("You have joined") })
               .after(10000, () => console.log("Connection interruption"))
    chan.onError(e => console.log("something went wrong", e))
    chan.onClose(e => console.log("channel closed", e))

    $form.submit( e => {
      e.preventDefault()
      chan.push("new:msg", {user: $username.val(),
                            body: $input.val(),
                            room_id: room_id})
      $input.val("")
    })

    chan.on("new:msg", msg => {
      $messages.append(this.messageTemplate(msg))
      this.scrollToBottom($messages)
    })

    chan.on("user:entered", msg => {
      var username = this.sanitize(msg.user || "anonymous")
      $messages.append(`<br/><i>[${username} entered]</i>`)
    })
  }

  static sanitize(html){ return $("<div/>").text(html).html() }

  static messageTemplate(msg){
    let username = this.sanitize(msg.user || "anonymous")
    let body     = this.sanitize(msg.body)

    return(`<p><strong>[${username}]</strong>&nbsp; ${body}<span class="pull-right">${msg.posted_at}</span></p>`)
  }

  static scrollToBottom(messages) {
    messages.scrollTop(messages.prop("scrollHeight"));
  }

}

$( () => App.init() )

export default App
