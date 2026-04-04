def tragos_preparables(ingredientes, tragosIngredientes):
    tragosPreparables = []
    
    for trago in tragosIngredientes:
        preparable = True
        ingredientes = trago["ingredientes"]
        for i in ingredientes:
            if i not in ingredientes:
                preparable = False
                break
        if preparable:
            tragosPreparables.append(trago["idTrago"])
    return tragosPreparables