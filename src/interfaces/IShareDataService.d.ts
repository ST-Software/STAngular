declare module STAngular {
    interface IShareDataService {
        getData(key: string): any;
        setData(key: string, data: any): void;
    }
}
