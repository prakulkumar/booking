import React from "react";
import Joi from "joi-browser";
import { Button } from "@material-ui/core";

import Input from "../common/Input/Input";
import Select from "../common/Select/Select";
import DatePicker from "../common/DatePicker/DatePicker";
import RadioGroup from "../common/RadioGroup/RadioGroup";

const handleInputChange = (input, formData, formErrors, formSchema) => {
  const errors = { ...formErrors };
  const errorMessage = validateProperty(input, formSchema);
  if (errorMessage) errors[input.name] = errorMessage;
  else delete errors[input.name];

  const data = { ...formData };
  data[input.name] = input.value;

  return { data, errors };
};

const validate = (data, schema) => {
  const options = { abortEarly: false };
  const { error } = Joi.validate(data, schema, options);
  if (!error) return null;

  const errors = {};
  const rooms = [];
  error.details = error.details.filter(
    error => error.type !== "object.allowUnknown"
  );
  for (let item of error.details) {
    if (item.path[0] === "rooms") {
      rooms.push({ message: item.message, index: item.path[1] });
      errors[item.path[0]] = rooms;
    } else errors[item.path[0]] = item.message;
  }
  return errors;
};

const validateProperty = ({ name, value }, formSchema) => {
  const obj = { [name]: value };
  const schema = { [name]: formSchema[name] };
  const { error } = Joi.validate(obj, schema);
  return error ? error.details[0].message : null;
};

/*
  renderInput
  renderDatepicker
  args:   id: string
          label: string
          type: string
          value: string
          onChange: function
          error: string
*/
const renderInput = args => <Input name={args.id} {...args} />;
const renderDatepicker = args => <DatePicker name={args.id} {...args} />;

/*
  renderSelect
  args:   id: string
          label: string
          value: string
          onChange: function
          options: array  => [{value: any, label: string}]
*/
const renderSelect = args => <Select name={args.id} {...args} />;

/*
  renderButton
  args:   type: string,
          size: string,
          label: string,
          color: string,
          className: classObject,
          disabled: boolean,
          onClick: function
*/
const renderButton = args => (
  <Button variant="contained" {...args}>
    {args.label}
  </Button>
);

/*
   renderRadioGroup
   parameters :- label: string, 
                 ariaLabel: string 
                 formGroupClass: object
                 name: string (required)
                 value: string (required) 
                 handleChange: function (required)
                 radioButtons: array (required)
*/
const renderRadioGroup = args => (
  <RadioGroup formGroupClass={args.customClass} {...args} />
);

export default {
  handleInputChange,
  validate,
  validateProperty,
  renderInput,
  renderSelect,
  renderDatepicker,
  renderButton,
  renderRadioGroup
};
