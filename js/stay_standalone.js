if(("standalone" in window.navigator)&&window.navigator.standalone){var noddy,remotes=false;document.addEventListener("click",function(a){noddy=a.target;while(noddy.nodeName!=="A"&&noddy.nodeName!=="HTML"){noddy=noddy.parentNode}if("href" in noddy&&noddy.href.indexOf("http")!==-1&&(noddy.href.indexOf(document.location.host)!==-1||remotes)){a.preventDefault();document.location.href=noddy.href}},false)};
