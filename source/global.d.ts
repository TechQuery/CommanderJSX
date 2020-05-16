declare namespace JSX {
    interface IntrinsicElements {
        [key: string]: import('./creator').Props<any>;
    }
}
