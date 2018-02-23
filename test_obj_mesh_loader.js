!function() {
  const div = document.createElement('div');
	div.innerHTML = '<canvas width=300 height=300></canvas>';
  const canvas = div.querySelector('canvas');
	document.addEventListener('DOMContentLoaded', function() {
    document.body.appendChild(div);
    
    const request = new XMLHttpRequest;
  
    request.onload = function() {
      const loader = new ObjMeshLoader(canvas, this.responseText);
      loader.perform();
    }
    request.open('get', 'teapot.obj.txt', true);
    request.send();
	});  
}();
