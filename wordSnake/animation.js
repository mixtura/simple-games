function ExpandAnimation(max) {
  return function(state, point, pivot) {
    var normal = point.substract(pivot).normalize();

    return point.add(normal.multiply(state * max));
  }
}
  
function SqueesAnimation(min) {
  return function(state, point, pivot) {
    var normal = point.substract(pivot).normalize();

    return point.substract(normal.multiply(state * min));
  }
}

function FixedState(state, anim) {
  return (_, point, pivot) => anim(state, point, pivot);
}

function Simultaneously(animations) {
  if(arguments.length > 1) {
    animations = Array.from(arguments);
  } else if(!Array.isArray(animations)) {
    animations = [animations];
  }

  return function(state, vec, pivot) {
    return animations.reduce((acc, anim) => anim(state, acc, pivot), vec);
  }
}


function AnimationChain(animations) {
  if(arguments.length > 1) {
    animations = Array.from(arguments);
  } else if(!Array.isArray(animations)) {
    animations = [animations];
  }

  return function(state, vec, pivot) 
  {
    return animations.reduce((acc, anim, index) => {
      var animLowerThreshold = index / animations.length;
      var animUpperThreshold = (index + 1) / animations.length;
      var animThreshold = new AnimationThreshold(anim, animLowerThreshold, animUpperThreshold);

      return animThreshold(state, acc, pivot)
    }, vec);
  }
}

function AnimationThreshold(anim, lower, upper) {
  return function(state, vec, pivot) {
    var animState = lower > state || upper <= state ? 0 : 1 - (state - lower) / (upper - lower); 

    return anim(animState, vec, pivot);
  }
}
