export default {
  functional: true,

  name: 'ElDivider',

  props: {
    direction: {
      type: String,
      default: 'horizontal',
      validator(val) {
        return ['horizontal', 'vertical'].indexOf(val) !== -1;
      }
    },

    contentPosition: {
      type: String,
      default: 'center',
      validator(val) {
        return ['left', 'center', 'right'].indexOf(val) !== -1;
      }
    }
  },

  render(h, context) {
    const $slots = context.slots();
    const { direction, contentPosition } = context.props;
    return (
      <div class={['baza-xls-divider', `baza-xls-divider--${direction}`]}>
        {
          $slots.default && direction !== 'vertical'
            ? <div class={['baza-xls-divider__text', `is-${contentPosition}`]}>{$slots.default}</div>
            : null
        }
      </div>
    );
  }
};
