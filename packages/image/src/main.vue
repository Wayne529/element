<template>
  <div class="baza-xls-image">
    <slot v-if="loading" name="placeholder">
      <div class="baza-xls-image__placeholder"></div>
    </slot>
    <slot v-else-if="error" name="error">
      <div class="baza-xls-image__error">{{ t('el.image.error') }}</div>
    </slot>
    <img
      v-else
      class="baza-xls-image__inner"
      v-bind="$attrs"
      v-on="$listeners"
      :src="src"
      :style="imageStyle"
      :class="{ 'baza-xls-image__inner--center': alignCenter }">
  </div>
</template>

<script>
  import Locale from 'element-ui/src/mixins/locale';
  import { on, off, getScrollContainer, isInContainer } from 'element-ui/src/utils/dom';
  import { isString, isHtmlElement } from 'element-ui/src/utils/types';
  import throttle from 'throttle-debounce/throttle';

  const isSupportObjectFit = () => document.documentElement.style.objectFit !== undefined;

  const ObjectFit = {
    NONE: 'none',
    CONTAIN: 'contain',
    COVER: 'cover',
    FILL: 'fill',
    SCALE_DOWN: 'scale-down'
  };

  export default {
    name: 'ElImage',

    mixins: [Locale],
    inheritAttrs: false,

    props: {
      src: String,
      fit: String,
      lazy: Boolean,
      scrollContainer: {}
    },

    data() {
      return {
        loading: true,
        error: false,
        show: !this.lazy,
        imageWidth: 0,
        imageHeight: 0
      };
    },

    computed: {
      imageStyle() {
        const { fit } = this;
        if (!this.$isServer && fit) {
          return isSupportObjectFit()
            ? { 'object-fit': fit }
            : this.getImageStyle(fit);
        }
        return {};
      },
      alignCenter() {
        return !this.$isServer && !isSupportObjectFit() && this.fit !== ObjectFit.FILL;
      }
    },

    watch: {
      src(val) {
        this.show && this.loadImage();
      },
      show(val) {
        val && this.loadImage();
      }
    },

    mounted() {
      if (this.lazy) {
        this.addLazyLoadListener();
      } else {
        this.loadImage();
      }
    },

    beforeDestroy() {
      this.lazy && this.removeLazyLoadListener();
    },

    methods: {
      loadImage() {
        if (this.$isServer) return;

        // reset status
        this.loading = true;
        this.error = false;

        const img = new Image();
        img.onload = e => this.handleLoad(e, img);
        img.onerror = this.handleError.bind(this);

        // bind html attrs
        // so it can behave consistently
        Object.keys(this.$attrs)
          .forEach((key) => {
            const value = this.$attrs[key];
            img.setAttribute(key, value);
          });
        img.src = this.src;
      },
      handleLoad(e, img) {
        this.imageWidth = img.width;
        this.imageHeight = img.height;
        this.loading = false;
      },
      handleError(e) {
        this.loading = false;
        this.error = true;
        this.$emit('error', e);
      },
      handleLazyLoad() {
        if (isInContainer(this.$el, this._scrollContainer)) {
          this.show = true;
          this.removeLazyLoadListener();
        }
      },
      addLazyLoadListener() {
        if (this.$isServer) return;

        const { scrollContainer } = this;
        let _scrollContainer = null;

        if (isHtmlElement(scrollContainer)) {
          _scrollContainer = scrollContainer;
        } else if (isString(scrollContainer)) {
          _scrollContainer = document.querySelector(scrollContainer);
        } else {
          _scrollContainer = getScrollContainer(this.$el);
        }

        if (_scrollContainer) {
          this._scrollContainer = _scrollContainer;
          this._lazyLoadHandler = throttle(200, this.handleLazyLoad);
          on(_scrollContainer, 'scroll', this._lazyLoadHandler);
          this.handleLazyLoad();
        }
      },
      removeLazyLoadListener() {
        const { _scrollContainer, _lazyLoadHandler } = this;

        if (this.$isServer || !_scrollContainer || !_lazyLoadHandler) return;

        off(_scrollContainer, 'scroll', _lazyLoadHandler);
        this._scrollContainer = null;
        this._lazyLoadHandler = null;
      },
      /**
       * simulate object-fit behavior to compatible with IE11 and other browsers which not support object-fit
       */
      getImageStyle(fit) {
        const { imageWidth, imageHeight } = this;
        const {
          clientWidth: containerWidth,
          clientHeight: containerHeight
        } = this.$el;

        if (!imageWidth || !imageHeight || !containerWidth || !containerHeight) return {};

        const vertical = imageWidth / imageHeight < 1;

        if (fit === ObjectFit.SCALE_DOWN) {
          const isSmaller = imageWidth < containerWidth && imageHeight < containerHeight;
          fit = isSmaller ? ObjectFit.NONE : ObjectFit.CONTAIN;
        }

        switch (fit) {
          case ObjectFit.NONE:
            return { width: 'auto', height: 'auto' };
          case ObjectFit.CONTAIN:
            return vertical ? { width: 'auto' } : { height: 'auto' };
          case ObjectFit.COVER:
            return vertical ? { height: 'auto' } : { width: 'auto' };
          default:
            return {};
        }
      }
    }
  };
</script>
