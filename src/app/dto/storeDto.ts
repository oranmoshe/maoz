class StoreDto {
  name: string;
  coordinate: CoordinateDto;
  constructor(name: string, coordinate: CoordinateDto) {
    this.name = name;
    this.coordinate = coordinate;
  }
}
