import { WampLoggerInterface } from './types';
export declare class WampLogger implements WampLoggerInterface {
    private debug;
    private prefix;
    constructor(debug: boolean);
    info(text: string, ...args: any[]): void;
    error(text: string, ...args: any[]): void;
    warn(text: string, ...args: any[]): void;
    event(text: string, ...args: any[]): void;
}
