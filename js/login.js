var cityVideo = document.getElementById( "cityVideo" );

function myFunction ()
{
    if ( cityVideo.paused )
    {
        cityVideo.play();
        btn.innerHTML = "Pause";
    } else
    {
        cityVideo.pause();
        btn.innerHTML = "Play";
    }
}