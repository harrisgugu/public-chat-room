$(function(){

    var socket = io();
    console.log("THis is index.js");

    $('#postBtn').click(function(e){
        console.log("posqt cliked");
        var msg = $('#outMsg').val();
        $('#outMsg').val('');
        socket.emit('postMessage',{msg:msg});
    });

    $( "#outMsg" ).on( "keyup", function ( event )
    {
        // Check if the enter key was pressed
        if ( event.keyCode === 13 )
        {
            // Trigger a click on the post button
            $( "#postBtn" ).click();
        }
    } );

    socket.on("hello",(msg)=>{
        console.log(msg);
    })

    socket.on('msgPosted',(message)=>{
        var msg = message.msg;
        var user = message.user;
        var date = message.timestamp;
        date = date.substring(0,19);
        console.log("msg:"+msg+"user:"+user+"time:"+date);
        var newBlock = $("<div class='outer'><div class = 'usertime'><div class='user'> user: "+user+" </div> <div class='time'>"+date+"</div> </div><div class='msg'>"+msg+" </div></div>");
        $('#displaychat').append(newBlock);
        $('#displaychat').scrollTop($('#displaychat')[0].scrollHeight);

    });

   
});