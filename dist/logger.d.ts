import { WampLoggerInterface } from './types';
export declare class WampLogger implements WampLoggerInterface {
    private debug;
    private prefix;
    constructor(debug: boolean);
    info(text: string, ...args: any[]): void;
    error(...args: any[]): void;
    warn(...args: any[]): void;
    event(text: string, ...args: any[]): void;
}
