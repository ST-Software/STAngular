declare module STAngular {
    interface IInputMaskService {
        //Mask is not provided => it will be read from mask attribute on input elements
        bindMask(context: JQuery, selector: string);

        //Mask is provided
        bindMask(context: JQuery, selector: string, mask: string);
    }
}