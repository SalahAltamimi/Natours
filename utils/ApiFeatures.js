class ApiFeatures {
  constructor(Model, query) {
    this.Model = Model;
    this.query = query;
  }
  filters() {
    const query1 = { ...this.query };

    const exclude = ['sort', 'fields', 'limit', 'page'];

    exclude.forEach((el) => delete query1[el]);

    const querys = JSON.parse(
      JSON.stringify(query1).replace(
        /\b(gt|gte|lte|lt)\b/g,
        (match) => `$${match}`
      )
    );
    this.Model = this.Model.find(querys);

    return this;
  }

  sort() {
    if (this.query.sort) {
      const sorts = JSON.parse(
        JSON.stringify(this.query.sort).split(',').join(' ')
      );
      this.Model.sort(sorts);
    }
    return this;
  }
  fileds() {
    if (this.query.fields) {
      const fields = JSON.parse(
        JSON.stringify(this.query.fields).split(',').join(' ')
      );
      this.Model.select(fields);
    }
    return this;
  }
  page() {
    const page = this.query.page * 1 || 1;
    const limit = this.query.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.Model.skip(skip).limit(limit);
    return this;
  }
}
exports.ApiFeatures = ApiFeatures;
