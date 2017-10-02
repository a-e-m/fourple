(function() {
	var interval;

	if (!('ongamepadconnected' in window)) {
	  // No gamepad events available, poll instead.
	  interval = setInterval(pollGamepads, 500);
	}

	function pollGamepads() {
	  var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);
	  for (var i = 0; i < gamepads.length; i++) {
		var gamepad = gamepads[i];
		if (gamepad && gamepad.id.search('Xbox') !== -1) {
		  main.state.gamepad = i;
		  clearInterval(interval);
		}
	  }
	}
})();

function handleGamepad() {
	if (main.state.gamepad === null) {
		main.mouse.down = main.mouse.mousedown;
		return;
	}
	var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);
	var gamepad = gamepads[main.state.gamepad];
	var x = gamepad.axes[0], y = gamepad.axes[1];
	if (Math.abs(x) < 0.1) {
		main.state.joyX = 0;	
	}
	else {
		main.state.joyX = Math.floor(x * 12);
		main.mouse.relX = main.state.joyX;
	}

	if (Math.abs(y) < 0.1) {
		main.state.joyY = 0;	
	}
	else {
		main.state.joyY = Math.floor(y * 12);
		main.mouse.relY = main.state.joyY;
	}
	main.mouse.down = gamepad.buttons[0].pressed || main.mouse.mousedown;
}

