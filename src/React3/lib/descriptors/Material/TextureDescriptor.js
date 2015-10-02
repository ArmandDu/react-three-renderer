import THREE from 'three';
import THREEElementDescriptor from '../THREEElementDescriptor';

import invariant from 'fbjs/lib/invariant';

import resource from '../decorators/resource';

import PropTypes from 'react/lib/ReactPropTypes';

import Uniform from '../../Uniform';

@resource class TextureDescriptor extends THREEElementDescriptor {
  constructor(react3RendererInstance:React3Renderer) {
    super(react3RendererInstance);

    this.registerSimpleProperties([
      'wrapS',
      'wrapT',
      'anisotropy',
    ]);

    this.propUpdates = {
      ...this.propUpdates,
      'repeat': this._setRepeat,
    };

    this.propTypes = {
      ...this.propTypes,

      url: PropTypes.string.isRequired,
      wrapS: PropTypes.number,
      wrapT: PropTypes.number,
      anisotropy: PropTypes.number,
      repeat: PropTypes.instanceOf(THREE.Vector2),
    };
  }

  _setRepeat = (threeObject, repeat) => {
    threeObject.repeat.copy(repeat);
  };

  construct(props) {
    if (props.hasOwnProperty('url')) {
      return THREE.ImageUtils.loadTexture(props.url);
    } else {
      invariant(false, 'The texture needs a url property.');
    }
  }

  setParent(texture, parentObject3D) {
    invariant(parentObject3D instanceof THREE.Material || parentObject3D instanceof Uniform,
      'Parent is not a material or a uniform');

    if (parentObject3D instanceof THREE.Material) {
      invariant(parentObject3D.map === null || parentObject3D.map === undefined, 'Parent already has a texture');
      parentObject3D.map = texture;
      // dispose to force a recreate
      parentObject3D.dispose();
    } else { // Uniform as per the assert above
      parentObject3D.setValue(texture);
    }

    super.setParent(texture, parentObject3D);
  }


  applyInitialProps(threeObject, props) {
    threeObject.userData = {
      ...threeObject.userData,
    };

    if (props.hasOwnProperty('repeat')) {
      threeObject.repeat.copy(props.repeat);
    }

    super.applyInitialProps(threeObject, props);
  }

  unmount(texture) {
    const parent = texture.userData.parentMarkup.threeObject;

    // could either be a resource description or an actual texture
    if (parent instanceof THREE.Material) {
      if (parent.map === texture) {
        parent.map = null;
        // dispose to force a recreate
        parent.dispose();
      }
    } else if (parent instanceof Uniform) {
      if (parent.value === texture) {
        parent.setValue(null);
      }
    }

    texture.dispose();

    super.unmount(texture);
  }

  highlight(threeObject) {
    const parent = threeObject.userData.parentMarkup.threeObject;
    parent.userData._descriptor.highlight(parent);
  }

  hideHighlight(threeObject) {
    const parent = threeObject.userData.parentMarkup.threeObject;
    parent.userData._descriptor.hideHighlight(parent);
  }
}

export default TextureDescriptor;
