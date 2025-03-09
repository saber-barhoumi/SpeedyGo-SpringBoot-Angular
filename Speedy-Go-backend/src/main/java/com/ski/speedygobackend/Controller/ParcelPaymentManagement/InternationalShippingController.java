package com.ski.speedygobackend.Controller.ParcelPaymentManagement;

import com.ski.speedygobackend.Entity.ParcelPaymentManagement.InternationalShipping;
import com.ski.speedygobackend.Service.ParcelPaymentManagement.InternationalShippingServiceImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RequestMapping("/Shipping")
@RestController
public class InternationalShippingController {

    private final InternationalShippingServiceImpl internationalShippingService;

    @Autowired
    public InternationalShippingController(InternationalShippingServiceImpl internationalShippingService) {
        this.internationalShippingService = internationalShippingService;
    }

    @PostMapping("/add")
    public InternationalShipping addInternationalShipping(@Valid @RequestBody InternationalShipping internationalShipping) {
        return internationalShippingService.addInternationalShipping(internationalShipping);
    }

    @GetMapping("/getAll")
    public List<InternationalShipping> getAllInternationalShippings() {
        return internationalShippingService.retrieveAll();
    }

    @GetMapping("/{id}")
    public Optional<InternationalShipping> getInternationalShippingById(@PathVariable Long id) {
        return Optional.ofNullable(internationalShippingService.retrieveInternationalShipping(id));
    }

    @PutMapping("/update/{id}")
    public InternationalShipping updateInternationalShipping(@PathVariable Long id, @RequestBody InternationalShipping internationalShipping) {
        return internationalShippingService.updateInternationalShipping(id, internationalShipping);
    }


    @DeleteMapping("delete/{id}")
    public void deleteInternationalShipping(@PathVariable Long id) {
        internationalShippingService.deleteInternationalShipping(id);
    }
}
