/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */

import '@stencil/core';

declare global {
  namespace JSX {
    interface Element {}
    export interface IntrinsicElements {}
  }
  namespace JSXElements {}

  interface HTMLElement {
    componentOnReady?: () => Promise<this | null>;
  }

  interface HTMLStencilElement extends HTMLElement {
    componentOnReady(): Promise<this>;

    forceUpdate(): void;
  }

  interface HTMLAttributes {}
}

import '@stencil/router';

import {
  SpotifyService,
} from './services';
import {
  RouterHistory,
} from '@stencil/router';
import {
  TransferProgress,
} from './components/transfer-progress/app-transfer-progress';

declare global {

  namespace StencilComponents {
    interface AppActiveUserCard {
      'user': any;
    }
  }

  interface HTMLAppActiveUserCardElement extends StencilComponents.AppActiveUserCard, HTMLStencilElement {}

  var HTMLAppActiveUserCardElement: {
    prototype: HTMLAppActiveUserCardElement;
    new (): HTMLAppActiveUserCardElement;
  };
  interface HTMLElementTagNameMap {
    'app-active-user-card': HTMLAppActiveUserCardElement;
  }
  interface ElementTagNameMap {
    'app-active-user-card': HTMLAppActiveUserCardElement;
  }
  namespace JSX {
    interface IntrinsicElements {
      'app-active-user-card': JSXElements.AppActiveUserCardAttributes;
    }
  }
  namespace JSXElements {
    export interface AppActiveUserCardAttributes extends HTMLAttributes {
      'user'?: any;
    }
  }
}


declare global {

  namespace StencilComponents {
    interface AppAlbumWall {
      'addAlbums': (albums: string[]) => void;
    }
  }

  interface HTMLAppAlbumWallElement extends StencilComponents.AppAlbumWall, HTMLStencilElement {}

  var HTMLAppAlbumWallElement: {
    prototype: HTMLAppAlbumWallElement;
    new (): HTMLAppAlbumWallElement;
  };
  interface HTMLElementTagNameMap {
    'app-album-wall': HTMLAppAlbumWallElement;
  }
  interface ElementTagNameMap {
    'app-album-wall': HTMLAppAlbumWallElement;
  }
  namespace JSX {
    interface IntrinsicElements {
      'app-album-wall': JSXElements.AppAlbumWallAttributes;
    }
  }
  namespace JSXElements {
    export interface AppAlbumWallAttributes extends HTMLAttributes {

    }
  }
}


declare global {

  namespace StencilComponents {
    interface AppAuthorizationModal {
      'spotifyService': SpotifyService;
      'transferId': string;
    }
  }

  interface HTMLAppAuthorizationModalElement extends StencilComponents.AppAuthorizationModal, HTMLStencilElement {}

  var HTMLAppAuthorizationModalElement: {
    prototype: HTMLAppAuthorizationModalElement;
    new (): HTMLAppAuthorizationModalElement;
  };
  interface HTMLElementTagNameMap {
    'app-authorization-modal': HTMLAppAuthorizationModalElement;
  }
  interface ElementTagNameMap {
    'app-authorization-modal': HTMLAppAuthorizationModalElement;
  }
  namespace JSX {
    interface IntrinsicElements {
      'app-authorization-modal': JSXElements.AppAuthorizationModalAttributes;
    }
  }
  namespace JSXElements {
    export interface AppAuthorizationModalAttributes extends HTMLAttributes {
      'spotifyService'?: SpotifyService;
      'transferId'?: string;
    }
  }
}


declare global {

  namespace StencilComponents {
    interface AppHome {

    }
  }

  interface HTMLAppHomeElement extends StencilComponents.AppHome, HTMLStencilElement {}

  var HTMLAppHomeElement: {
    prototype: HTMLAppHomeElement;
    new (): HTMLAppHomeElement;
  };
  interface HTMLElementTagNameMap {
    'app-home': HTMLAppHomeElement;
  }
  interface ElementTagNameMap {
    'app-home': HTMLAppHomeElement;
  }
  namespace JSX {
    interface IntrinsicElements {
      'app-home': JSXElements.AppHomeAttributes;
    }
  }
  namespace JSXElements {
    export interface AppHomeAttributes extends HTMLAttributes {

    }
  }
}


declare global {

  namespace StencilComponents {
    interface AppNotFound {

    }
  }

  interface HTMLAppNotFoundElement extends StencilComponents.AppNotFound, HTMLStencilElement {}

  var HTMLAppNotFoundElement: {
    prototype: HTMLAppNotFoundElement;
    new (): HTMLAppNotFoundElement;
  };
  interface HTMLElementTagNameMap {
    'app-not-found': HTMLAppNotFoundElement;
  }
  interface ElementTagNameMap {
    'app-not-found': HTMLAppNotFoundElement;
  }
  namespace JSX {
    interface IntrinsicElements {
      'app-not-found': JSXElements.AppNotFoundAttributes;
    }
  }
  namespace JSXElements {
    export interface AppNotFoundAttributes extends HTMLAttributes {

    }
  }
}


declare global {

  namespace StencilComponents {
    interface AppRoot {

    }
  }

  interface HTMLAppRootElement extends StencilComponents.AppRoot, HTMLStencilElement {}

  var HTMLAppRootElement: {
    prototype: HTMLAppRootElement;
    new (): HTMLAppRootElement;
  };
  interface HTMLElementTagNameMap {
    'app-root': HTMLAppRootElement;
  }
  interface ElementTagNameMap {
    'app-root': HTMLAppRootElement;
  }
  namespace JSX {
    interface IntrinsicElements {
      'app-root': JSXElements.AppRootAttributes;
    }
  }
  namespace JSXElements {
    export interface AppRootAttributes extends HTMLAttributes {

    }
  }
}


declare global {

  namespace StencilComponents {
    interface AppStepOne {
      'spotifyService': SpotifyService;
    }
  }

  interface HTMLAppStepOneElement extends StencilComponents.AppStepOne, HTMLStencilElement {}

  var HTMLAppStepOneElement: {
    prototype: HTMLAppStepOneElement;
    new (): HTMLAppStepOneElement;
  };
  interface HTMLElementTagNameMap {
    'app-step-one': HTMLAppStepOneElement;
  }
  interface ElementTagNameMap {
    'app-step-one': HTMLAppStepOneElement;
  }
  namespace JSX {
    interface IntrinsicElements {
      'app-step-one': JSXElements.AppStepOneAttributes;
    }
  }
  namespace JSXElements {
    export interface AppStepOneAttributes extends HTMLAttributes {
      'spotifyService'?: SpotifyService;
    }
  }
}


declare global {

  namespace StencilComponents {
    interface AppStepThree {
      'history': RouterHistory;
      'spotifyService': SpotifyService;
    }
  }

  interface HTMLAppStepThreeElement extends StencilComponents.AppStepThree, HTMLStencilElement {}

  var HTMLAppStepThreeElement: {
    prototype: HTMLAppStepThreeElement;
    new (): HTMLAppStepThreeElement;
  };
  interface HTMLElementTagNameMap {
    'app-step-three': HTMLAppStepThreeElement;
  }
  interface ElementTagNameMap {
    'app-step-three': HTMLAppStepThreeElement;
  }
  namespace JSX {
    interface IntrinsicElements {
      'app-step-three': JSXElements.AppStepThreeAttributes;
    }
  }
  namespace JSXElements {
    export interface AppStepThreeAttributes extends HTMLAttributes {
      'history'?: RouterHistory;
      'spotifyService'?: SpotifyService;
    }
  }
}


declare global {

  namespace StencilComponents {
    interface AppStepTwo {
      'history': RouterHistory;
      'spotifyService': SpotifyService;
    }
  }

  interface HTMLAppStepTwoElement extends StencilComponents.AppStepTwo, HTMLStencilElement {}

  var HTMLAppStepTwoElement: {
    prototype: HTMLAppStepTwoElement;
    new (): HTMLAppStepTwoElement;
  };
  interface HTMLElementTagNameMap {
    'app-step-two': HTMLAppStepTwoElement;
  }
  interface ElementTagNameMap {
    'app-step-two': HTMLAppStepTwoElement;
  }
  namespace JSX {
    interface IntrinsicElements {
      'app-step-two': JSXElements.AppStepTwoAttributes;
    }
  }
  namespace JSXElements {
    export interface AppStepTwoAttributes extends HTMLAttributes {
      'history'?: RouterHistory;
      'spotifyService'?: SpotifyService;
    }
  }
}


declare global {

  namespace StencilComponents {
    interface AppTransferForm {

    }
  }

  interface HTMLAppTransferFormElement extends StencilComponents.AppTransferForm, HTMLStencilElement {}

  var HTMLAppTransferFormElement: {
    prototype: HTMLAppTransferFormElement;
    new (): HTMLAppTransferFormElement;
  };
  interface HTMLElementTagNameMap {
    'app-transfer-form': HTMLAppTransferFormElement;
  }
  interface ElementTagNameMap {
    'app-transfer-form': HTMLAppTransferFormElement;
  }
  namespace JSX {
    interface IntrinsicElements {
      'app-transfer-form': JSXElements.AppTransferFormAttributes;
    }
  }
  namespace JSXElements {
    export interface AppTransferFormAttributes extends HTMLAttributes {
      'onStartTransfer'?: (event: CustomEvent) => void;
    }
  }
}


declare global {

  namespace StencilComponents {
    interface AppTransferProgress {
      'transferProgress': TransferProgress;
    }
  }

  interface HTMLAppTransferProgressElement extends StencilComponents.AppTransferProgress, HTMLStencilElement {}

  var HTMLAppTransferProgressElement: {
    prototype: HTMLAppTransferProgressElement;
    new (): HTMLAppTransferProgressElement;
  };
  interface HTMLElementTagNameMap {
    'app-transfer-progress': HTMLAppTransferProgressElement;
  }
  interface ElementTagNameMap {
    'app-transfer-progress': HTMLAppTransferProgressElement;
  }
  namespace JSX {
    interface IntrinsicElements {
      'app-transfer-progress': JSXElements.AppTransferProgressAttributes;
    }
  }
  namespace JSXElements {
    export interface AppTransferProgressAttributes extends HTMLAttributes {
      'transferProgress'?: TransferProgress;
    }
  }
}

declare global { namespace JSX { interface StencilJSX {} } }
