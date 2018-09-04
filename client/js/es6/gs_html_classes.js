/* global $ */

import * as html from './html_classes.js';
import * as logic from '../../../common/logic_classes.mjs';

var socket = undefined;
var environment = undefined;


function init(env) {
    environment = env;
    socket = env.socket;
}

function get_attr_by_attr_in_array(array, search_attr, search_value, ret_attr) {
    return array[array.findIndex(item => item[search_attr] == search_value)][ret_attr];
}

function get_styles(categories) {
    let open_xs = '@media (max-width: 575px) {'
    let open_sm = '@media (min-width: 576px) and (max-width: 767px){'
    let open_md = '@media (min-width: 768px) and (max-width: 991px){'
    let open_lg = '@media (min-width: 992px) and (max-width: 1199px){'
    let open_xl = '@media (min-width: 1200px) {'

    let styles = open_xs;
    for (let category of categories) {
        let color = category.color
        let uid = category.uid
        let style = ` .cl${uid} { background: ${color}; overflow: hidden; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block}`
        // let style = `div { background: ${color};}`
        styles += style;
    }
    styles += '}'


    return styles;
}

class expenditure_input_form extends html.bs_form {
    constructor(parent, selectable_items, fill_expenditure) {
        const form_mode = {
            ADD: Symbol('add'),
            EDIT: Symbol('edit')
        }
        Object.freeze(form_mode)
        let mode = (fill_expenditure === undefined) ? form_mode.ADD : form_mode.EDIT;

        let expenditure_uid // = 0
        if (mode === form_mode.ADD) {
            expenditure_uid = 0;
        }

        //
        // Date
        //

        let date_label = 'Date';
        let date_input = new html.date_input('autoparent', new Date(), new Map([
            ['class', 'form-control']
        ]));
        let date_form = new html.bs_form_group('autoparent', date_label, date_input, new Map([
            ['class', 'col-6 col-sm-4 col-md-3 mb-3'],
        ]));

        //
        // Buyer
        //
        let buyer_label = 'Buyer';
        let buyer_select = new html.rich_select('autoparent', selectable_items.buyers, undefined, new Map([
            ['class', 'form-control']
        ]));
        let buyer_form = new html.bs_form_group('autoparent', buyer_label, buyer_select, new Map([
            ['class', 'col-6 col-sm-4 col-md-3 mb-3'],
        ]));


        //
        // Category
        //
        let category_label = 'Category';
        let category_select = new html.rich_select('autoparent', selectable_items.categories, undefined, new Map([
            ['class', 'form-control']
        ]));
        let category_form = new html.bs_form_group('autoparent', category_label, category_select, new Map([
            ['class', 'col-12 col-sm-4 col-md-3 order-md-4 mb-3'],
        ]));


        //
        // Detail
        //
        let details_label = 'Detail';
        let details_text_input = new html.text_input('autoparent', new Map([
            ['class', 'form-control']
        ]));
        let details_form = new html.bs_form_group('autoparent', details_label, details_text_input, new Map([
            ['class', 'col-8 col-sm-8 col-md-6 order-md-5 mb-3'],
        ]));

        //
        // Amount
        //
        let amount_label = 'Amount';
        let amount_text_input = new html.number_input('autoparent', new Map([
            ['class', 'form-control']
        ]));
        let amount_form = new html.bs_form_group('autoparent', amount_label, amount_text_input, new Map([
            ['class', 'col-4 col-sm-4 col-md-2 order-md-6 mb-3'],
        ]));

        //
        // Pay Method
        //
        let pay_method_label = 'Pay Method';
        let pay_method_select = new html.rich_select('autoparent', selectable_items.pay_methods, undefined, new Map([
            ['class', 'form-control']
        ]));
        let pay_method_form = new html.bs_form_group('autoparent', pay_method_label, pay_method_select, new Map([
            ['class', 'col-12 col-sm-8 col-md-6 mb-3 order-11 order-md-3'],
        ]));

        //
        // Submit Button
        //
        let add_button = new html.button('autoparent', 'Add', new Map([
            ['type', 'button'],
            ['class', 'col-12 col-sm-4 col-md-1 mb-3 order-12 order-md-12'],
        ]));
        let cancel_button = new html.button('autoparent', 'Cancel', new Map([
            ['type', 'button'],
            ['class', 'col-12 col-sm-4 col-md-1 mb-3 order-12 order-md-12'],
        ]));
        let delete_button = new html.button('autoparent', 'Delete', new Map([
            ['type', 'button'],
            ['class', 'col-12 col-sm-4 col-md-1 mb-3 order-12 order-md-12'],
        ]));
        let save_button = new html.button('autoparent', 'Save', new Map([
            ['type', 'button'],
            ['class', 'col-12 col-sm-4 col-md-1 mb-3 order-12 order-md-12'],
        ]));

        add_button.set_handler('click', () => {
            console.log("add.")
            socket.emit('new_expenditure', this.get_values())
        })

        save_button.set_handler('click', () => {
            console.log("save.")
            let edit_expenditure = this.get_values();
            edit_expenditure.uid = fill_expenditure.uid
            console.log(edit_expenditure)
            socket.emit('edit_expenditure', edit_expenditure)
        })

        let form_fields = {
            date: date_form,
            buyer: buyer_form,
            category: category_form,
            pay_method: pay_method_form,
            detail: details_form,
            amount: amount_form,
        };

        let form_buttons = {
            add_button: add_button,
            cancel_button: cancel_button,
            delete_button: delete_button,
            save_button: save_button
        }

        super(parent, form_fields, form_buttons, new Map([
            ['class', 'form-row']
        ]));


        switch (mode) {
            case form_mode.ADD:
                this.set_add_mode();
                break;
            case form_mode.EDIT:
                this.set_edit_mode(fill_expenditure);
                break;
            default:
                console.error("A terrible error ocurred!")
        }
    }

    update_options(selectable_items) {
        this.fields.buyer.control.update_options(selectable_items.buyers);
        this.fields.category.control.update_options(selectable_items.categories);
        this.fields.pay_method.control.update_options(selectable_items.pay_methods);
    }


    set_edit_mode(fill_expenditure) {
        this.buttons.add_button.hide()
        this.set_values(fill_expenditure);
        this.add_attr("data-expenditure-uid", fill_expenditure.uid)
    }

    set_add_mode() {
        this.add_attr("data-expenditure-uid", this.expenditure_uid)
        this.buttons.add_button.unhide()
        this.buttons.cancel_button.hide()
        this.buttons.delete_button.hide()
        this.buttons.save_button.hide()
    }
}

class expenditure_row extends html.bs_row {
    constructor(parent, expenditure, selectable_items) {
        let elements = [
            (new Date(expenditure.date)).toLocaleDateString(),
            get_attr_by_attr_in_array(selectable_items.buyers, '_value', expenditure.buyer, '_label'),
            get_attr_by_attr_in_array(selectable_items.categories, '_value', expenditure.category, '_label'),
            expenditure.detail,
            expenditure.amount,
            get_attr_by_attr_in_array(selectable_items.pay_methods, '_value', expenditure.pay_method, '_label')
        ];
        let col_desc = [
            'col-3 col-md-2',
            'col-3 col-md-1',
            'col-6 col-md-2',
            'col-12 col-md-3',
            'col-4 col-md-2',
            'col-8 col-md-2',
        ];
        let category_class = `cl${expenditure.category}`;
        super(parent, elements, col_desc, [
            ["class", category_class],
        ]);
        this.expenditure = expenditure;
        this.selectable_items = selectable_items;
    }

    repr() {
        let date_string = (new Date(this.expenditure.date)).toLocaleDateString();
        let ret = date_string + " ";
        ret += get_attr_by_attr_in_array(this.selectable_items.buyers, '_value', this.expenditure.buyer, '_label') + " ";
        ret += get_attr_by_attr_in_array(this.selectable_items.categories, '_value', this.expenditure.category, '_label') + " ";
        ret += this.expenditure.detail + " ";
        ret += this.expenditure.amount + " ";
        ret += get_attr_by_attr_in_array(this.selectable_items.pay_methods, '_value', this.expenditure.pay_method, '_label');
        return ret;
    }
}

class expenditure_list extends html.div {
    constructor(parent, expenditures, selectable_items) {
        let list_items = expenditures.map((expenditure) => new expenditure_row('autoparent', expenditure, selectable_items));
        for (let item of list_items) {
            item.set_handler('click', () => {
                let edit_transaction_form = new expenditure_input_form("edit_expenditure", {
                    buyers: selectable_items.buyers,
                    categories: selectable_items.categories,
                    pay_methods: selectable_items.pay_methods
                }, item.expenditure)
                edit_transaction_form.draw();
                edit_transaction_form.link_handlers();

                // item.remove(); // the items of items_list will be put inside an 'li' element by the unrdered_list contructor, so we romeve the 'li' element.
                // socket.emit('delete_expenditure', item.expenditure.uid);
            });

        }
        let list = new html.div('autoparent', list_items);
        let inner = [list, ];
        super(parent, inner);
    }
}

export { init, expenditure_input_form, expenditure_row, expenditure_list, get_styles };
