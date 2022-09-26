import { useIsRouting } from '@solidjs/router'
import NProgress from 'nprogress'
import { Component, createEffect, createSignal, mergeProps } from 'solid-js'
import { isServer } from 'solid-js/web'

export type SolidProgressBarProps = {
  /**
   * The color of the bar.
   * @default "#80ffd9"
   */
  color?: string
  /**
   * The start position of the bar.
   * @default 0.3
   */
  startPosition?: number
  /**
   * The stop delay in milliseconds.
   * @default 200
   */
  stopDelayMs?: number
  /**
   * The height of the bar.
   * @default 3
   */
  height?: number
  /**
   * The other NProgress configuration options to pass to NProgress.
   * @default null
   */
  options?: Partial<NProgress.NProgressOptions>
  /**
   * The nonce attribute to use for the `style` tag.
   * @default undefined
   */
  nonce?: string
}

const DEFAULT_PROPS = {
  color: '#b0f6ff',
  startPosition: 0.3,
  stopDelayMs: 400,
  height: 3,
}

export const SolidNProgress: Component = (props: SolidProgressBarProps) => {
  const merged = mergeProps(DEFAULT_PROPS, props)

  if (!isServer) {
    const [timer, setTimer] = createSignal(0)
    const [progressing, setProgressing] = createSignal(false)
    const isRouting = useIsRouting()

    createEffect(() => {
      if (merged.options) NProgress.configure(merged.options)
    })
    createEffect(() => {
      if (isRouting() && !progressing()) {
        setProgressing(true)
        NProgress.set(merged.startPosition)
        NProgress.start()
      } else if (!isRouting() && progressing()) {
        setProgressing(false)
        if (timer()) clearTimeout(timer())
        setTimer(setTimeout(() => NProgress.done(true), merged.stopDelayMs))
      }
    })
  }

  return (
    <style
      nonce={merged.nonce || ''}
      // eslint-disable-next-line solid/no-innerhtml
      innerHTML={`
        #nprogress {
          pointer-events: none;
        }
        #nprogress .bar {
          background: ${merged.color};
          position: fixed;
          z-index: 9999;
          top: 0;
          left: 0;
          width: 100%;
          height: ${merged.height}px;
        }
        #nprogress .peg {
          display: block;
          position: absolute;
          right: 0px;
          width: 100px;
          height: 100%;
          box-shadow: 0 0 10px ${merged.color}, 0 0 5px ${merged.color};
          opacity: 1;
          -webkit-transform: rotate(3deg) translate(0px, -4px);
          -ms-transform: rotate(3deg) translate(0px, -4px);
          transform: rotate(3deg) translate(0px, -4px);
        }
        #nprogress .spinner {
          display: block;
          position: fixed;
          z-index: 1031;
          top: 15px;
          right: 15px;
        }
        #nprogress .spinner-icon {
          width: 18px;
          height: 18px;
          box-sizing: border-box;
          border: solid 2px transparent;
          border-top-color: ${merged.color};
          border-left-color: ${merged.color};
          border-radius: 50%;
          -webkit-animation: nprogresss-spinner 400ms linear infinite;
          animation: nprogress-spinner 400ms linear infinite;
        }
        .nprogress-custom-parent {
          overflow: hidden;
          position: relative;
        }
        .nprogress-custom-parent #nprogress .spinner,
        .nprogress-custom-parent #nprogress .bar {
          position: absolute;
        }
        @-webkit-keyframes nprogress-spinner {
          0% {
            -webkit-transform: rotate(0deg);
          }
          100% {
            -webkit-transform: rotate(360deg);
          }
        }
        @keyframes nprogress-spinner {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
    `}
    />
  )
}
