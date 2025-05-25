# TradeNavigator Export/Import Functionality

## Overview

The TradeNavigator platform now includes comprehensive export and import functionality, allowing users to save, share, and reuse their calculation templates. This feature is available in both the Calculation History and Templates sections of the application.

## Features

### Export Capabilities
- **Multiple Format Support**: Export templates in JSON or CSV formats
- **Custom Naming**: Add custom filenames to exported templates
- **Calculation to Template**: Convert any calculation result directly to a reusable template

### Import Capabilities
- **Format Validation**: Robust validation ensures only valid templates can be imported
- **Duplicate Handling**: Smart handling of templates with duplicate names
- **Type Detection**: Automatic detection of template types (Tariff Analysis, Cost Breakdown, Route Analysis)

### Templates Management
- **Categorized Views**: Filter templates by type for easier management
- **Search Functionality**: Quickly find templates by name, description, or tags
- **Template Cards**: Visual representation of templates with key information
- **One-Click Use**: Apply templates to new calculations with a single click

## Using Export/Import

### Exporting a Template
1. Navigate to the Calculation History page
2. Find a calculation you want to export
3. Click the Export icon (download arrow)
4. Choose your preferred format (JSON recommended for full fidelity)
5. Optionally provide a custom filename
6. Click Export to download the template file

### Importing a Template
1. Navigate to either the Calculation History or Templates page
2. Click the Import button
3. Select a template file from your device
4. Review the template information in the preview tab
5. Click Import Template to add it to your collection

### Creating a New Template
1. Navigate to the Templates page
2. Click the New Template button
3. Select the template type
4. Provide a name and optional description
5. Click Create Template
6. The template will be added to your collection and can be used for new calculations

### Using a Template
1. Navigate to the Templates page
2. Find the template you want to use
3. Click the Use button
4. You'll be redirected to the appropriate calculation page with the template data pre-filled

## Template Types

TradeNavigator supports four types of templates:

1. **Tariff Analysis**: Templates for calculating import/export duties and taxes
2. **Cost Breakdown**: Templates for comprehensive cost analysis including shipping, insurance, and handling
3. **Route Analysis**: Templates for optimizing shipping routes and transportation methods
4. **Custom Templates**: Flexible templates for specialized calculations

## Tips for Effective Template Management

- **Use Descriptive Names**: Give your templates clear, descriptive names that indicate their purpose
- **Add Tags**: Use tags to categorize templates and make them easier to find
- **Include Descriptions**: Add detailed descriptions to help yourself and others understand the purpose of each template
- **Regular Cleanup**: Delete unused templates to keep your workspace organized
- **Share Templates**: Export templates to share with colleagues for consistent calculations across your organization

## Technical Notes

- Templates are validated using Zod schemas to ensure data integrity
- JSON format preserves all template data, while CSV is more compatible but may lose some complex data structures
- Templates are currently stored in the browser's local storage; future updates will add cloud storage options
