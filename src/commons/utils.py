def tragos_preparables(ingredientes, tragosIngredientes):
    tragosPreparables = []
    print(ingredientes)
    print(tragosIngredientes)

    for trago in tragosIngredientes:
        preparable = True
        iTrago = trago["ingredientes"]
        for i in iTrago:
            if i not in ingredientes:
                preparable = False
                break
        if preparable:
            tragosPreparables.append(trago["idTrago"])
    return tragosPreparables