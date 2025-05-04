package com.ski.speedygobackend.Controller.ParcelPaymentManagement;

import com.ski.speedygobackend.Entity.ParcelPaymentManagement.Parcel;
import com.ski.speedygobackend.Service.ParcelPaymentManagement.IParcelServices;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RequestMapping("parcel")
@RestController
public class ParcelRestController {
    private final IParcelServices parcelServices;
    @PostMapping("/add")
    public Parcel addParcel(@RequestBody Parcel parcel) {
        return parcelServices.addParcel(parcel);
    }

    @PutMapping("/update")
    public Parcel updateParcel(@RequestBody Parcel parcel){
        return parcelServices.updateParcel(parcel);
    }

    @GetMapping("get/{parcelId}")
    public Parcel getParcel (@PathVariable Long parcelId){
        return parcelServices.retrieveParcel(parcelId);
    }

    @GetMapping("/getAll")
    public List<Parcel> getAll(){
        return parcelServices.retrieveAll();
    }

    @DeleteMapping("/delete/{parcelId}")
    public void deleteParcel (@PathVariable Long parcelId){
        parcelServices.deleteParcel(parcelId);
    }
}
