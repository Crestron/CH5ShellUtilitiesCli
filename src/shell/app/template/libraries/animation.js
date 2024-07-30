// Copyright (C) 2020 to the present, Crestron Electronics, Inc.
// All rights reserved.
// No part of this software may be reproduced in any form, machine
// or natural, without the express written consent of Crestron Electronics.
// Use of this source code is subject to the terms of the Crestron Software License Agreement 
// under which you licensed this source code.  
/* jslint es6 */

const templateAnimationEffects = (function () {

	"use strict";

	const effects = {
		"fadeOutUpBig": ["animate__animated", "animate__fadeOutUpBig"],
		"fadeInUpBig": ["animate__animated", "animate__fadeInUpBig"],
		"fadeOutDownBig": ["animate__animated", "animate__fadeOutDownBig"],
		"fadeInDownBig": ["animate__animated", "animate__fadeInDownBig"],
		"fadeOutUpBigFast": ["animate__animated", "animate__fadeOutUpBig", "animate__fast"],
		"fadeInUpBigFast": ["animate__animated", "animate__fadeInUpBig", "animate__fast"],
		"fadeOutDownBigFast": ["animate__animated", "animate__fadeOutDownBig", "animate__fast"],
		"fadeInDownBigFast": ["animate__animated", "animate__fadeInDownBig", "animate__fast"],
		"fadeOut": ["animate__animated", "animate__fadeOut"],
		"fadeOutSlow": ["animate__animated", "animate__fadeOut", "animate__slow"],
		"fadeIn": ["animate__animated", "animate__fadeIn"],
		"fadeInSlow": ["animate__animated", "animate__fadeIn", "animate__slow"],
		"fadeInFast": ["animate__animated", "animate__fadeIn", "animate__fast"],
		"zoomIn": ["animate__animated", "animate__zoomIn"],
		"zoomOut": ["animate__animated", "animate__zoomOut"],
		"fadeOutFast": ["animate__animated", "animate__fadeOut", "animate__fast"]
	};
	
	function setTransition(selectedElement) {
		const selectedEffect = effects.fadeIn;
		for (let i = 0; i < selectedEffect.length; i++) {
			selectedElement.classList.add(selectedEffect[i]);
		}
	}

	return {
		setTransition
	};

}());
