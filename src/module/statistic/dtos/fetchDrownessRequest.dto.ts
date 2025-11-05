import { IsNotEmpty } from "class-validator"
import { EyeStatusENUM } from "../enums/eye-status.enum"

export class fetchDrownessRequestDTO {
  @IsNotEmpty()
  ear_smooth: number
  
  @IsNotEmpty()
  status: EyeStatusENUM
}